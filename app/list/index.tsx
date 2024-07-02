
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthConText } from '@/store/AuthContext';
import { apiCar } from '@/api/apiConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

interface CarModel {
    id: number;
    images: string[];
    car_model: {
        brand: string;
        model: string;
        year: number;
    };
    rating: number;
    total_trip: number;
    price: number;
}

interface Fuel {
    code: string;
    text: string;
}

interface Motion {
    code: string;
    text: string;
}

const categories = [
    {
        key: 'brands',
        icon: <TabBarIcon name='earth' size={40} />,
        img: require('@/assets/images/global.png'),
        label: 'Hãng xe',
    },
    {
        key: 'seats',
        icon: <TabBarIcon name='seat' size={40} />,
        img: require('@/assets/images/seat.png'),
        label: 'Số chỗ',
    },
    {
        key: 'fuels',
        icon: <TabBarIcon name='gas-station-outline' size={40} />,
        img: require('@/assets/images/gasoline.png'),
        label: 'Nhiên liệu',
    },
    {
        key: 'motions',
        icon: <TabBarIcon name='car-shift-pattern' size={40} />,
        img: require('@/assets/images/gear_stick.png'),
        label: 'Truyền động',
    },
];

const ListProductScreen: React.FC = () => {
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;
    const router = useRouter();
    const params = useLocalSearchParams()
    const { startDate, endDate } = params



    const isFocused = useIsFocused();
    const [carList, setCarList] = useState<CarModel[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [fuels, setFuels] = useState<Fuel[]>([]);
    const [motions, setMotions] = useState<Motion[]>([]);
    const [seats, setSeats] = useState<number[]>([]);
    const [parkingLots, setParkingLots] = useState<string[]>([]);

    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
    const [selectedMotions, setSelectedMotions] = useState<string[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [selectedParkingLots, setSelectedParkingLots] = useState<string[]>([]);

    const [parsedStartDate, setParsedStartDate] = useState<Date>(new Date());
    const [parsedEndDate, setParsedEndDate] = useState<Date>(new Date());

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<{ key: string; img: any; label: string } | null>(null);

    useEffect(() => {
        filterCar();
    }, [isFocused, parsedStartDate, parsedEndDate, selectedBrands, selectedFuels, selectedMotions, selectedSeats, selectedParkingLots]);

    useEffect(() => {
        fetchMetaData();
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            setParsedStartDate(new Date(startDate as any));
            setParsedEndDate(new Date(endDate as any));
            console.log("startDate: ", startDate)
            console.log("parsedStartDate: ", parsedStartDate)
            console.log("UTC startDate: ", parsedStartDate.toISOString())
        }
    }, [startDate, endDate]);

    useEffect(() => {
        // Log UTC Date
        console.log('UTC Date:', parsedStartDate.toISOString());

        // Display Date in 'vi-VN' Locale
        const formattedStartDate = parsedStartDate.toLocaleDateString('vi-VN');
        console.log('Formatted Start Date:', formattedStartDate);
    }, [parsedStartDate]);

    const handleStartDateChange = (event: Event, selectedDate?: Date) => {
        const currentDate = selectedDate || parsedStartDate;
        const minDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // Minimum start date, 2 hours from now

        if (currentDate < minDate) {
            Alert.alert('', 'Thời gian nhận xe ít nhất kể từ 2 tiếng tính từ hiện tại');
        } else {
            setParsedStartDate(currentDate);
            const nextDay = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Next day from the current start date
            if (nextDay) {
                setParsedEndDate(nextDay);
            }
        }
    };

    const handleEndDateChange = (event: Event, selectedDate?: Date) => {
        const currentDate = selectedDate || parsedEndDate;
        const minDate = parsedStartDate || new Date();
        if (currentDate <= minDate) {
            Alert.alert('', 'Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày');
        } else {
            if (currentDate.getTime() - parsedStartDate.getTime() < 24 * 60 * 60 * 1000) {
                Alert.alert('', 'Thời gian thuê phải tối thiểu là 1 ngày');
            } else {
                setParsedEndDate(currentDate);
            }
        }
    };

    const filterCar = async () => {
        try {
            const response = await axios.get(`${apiCar.filterCar}`, {
                params: {
                    start_date: parsedStartDate.toISOString(),
                    end_date: parsedEndDate.toISOString(),
                    brands: selectedBrands.join(','),
                    fuels: selectedFuels.join(','),
                    motions: selectedMotions.join(','),
                    number_of_seats: selectedSeats.join(','),
                    parking_lots: selectedParkingLots.join(','),
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const filterCarData: CarModel[] = response.data.data;
            setCarList(filterCarData);
        } catch (error: any) {
            if (error.response.data.error_code === 10048) {
                Alert.alert('Lỗi', 'Không thể tìm kiếm xe');
            } else {
                console.log("Error: ", error.response.data.message);
            }
        }
    };

    // Fetch meta data
    const fetchMetaData = async () => {
        try {
            const response = await axios.get(apiCar.fetchMetaData);
            const meta = response.data;

            const uniqueBrands = [...new Set(meta.models.map((car: any) => car.brand))];
            setBrands(uniqueBrands as any);
            const uniqueSeats = [...new Set(meta.models.map((car: any) => car.number_of_seats))];
            setSeats(uniqueSeats as any);
            setFuels(meta.fuels);
            setMotions(meta.motions);
        } catch (error) {
            console.log('Failed to fetch meta data: ', error);
        }
    };

    const handleCategoryPress = (category: { key: string; img: any; label: string }) => {
        setSelectedCategory(category);
        setOpenModal(true);
    };

    const handleOptionSelect = (option: string) => {
        let updatedSelection: string[];
        switch (selectedCategory?.key) {
            case 'brands':
                updatedSelection = toggleSelection(selectedBrands, option);
                setSelectedBrands(updatedSelection);
                break;
            case 'seats':
                updatedSelection = toggleSelection(selectedSeats, parseInt(option, 10));
                setSelectedSeats(updatedSelection as any);
                break;
            case 'fuels':
                updatedSelection = toggleSelection(selectedFuels, option);
                setSelectedFuels(updatedSelection);
                break;
            case 'motions':
                updatedSelection = toggleSelection(selectedMotions, option);
                setSelectedMotions(updatedSelection);
                break;
            default:
                break;
        }
    };

    const toggleSelection = (currentSelection: any[], option: any) => {
        if (currentSelection.includes(option)) {
            return currentSelection.filter(item => item !== option);
        } else {
            return [...currentSelection, option];
        }
    };

    const renderModalContent = () => {
        if (!selectedCategory) {
            return null;
        }

        let options: { key: string; label: string }[] = [];
        switch (selectedCategory.key) {
            case 'brands':
                options = brands ? brands.map(brand => ({ key: brand, label: brand })) : [];
                break;
            case 'seats':
                options = seats ? seats.map(seat => ({ key: seat.toString(), label: `${seat} chỗ` })) : [];
                break;
            case 'fuels':
                options = fuels ? fuels.map(fuel => ({ key: fuel.code, label: fuel.text })) : [];
                break;
            case 'motions':
                options = motions ? motions.map(motion => ({ key: motion.code, label: motion.text })) : [];
                break;
            default:
                break;
        }

        const selectedOptions = (categoryKey: string) => {
            switch (categoryKey) {
                case 'brands':
                    return selectedBrands;
                case 'seats':
                    return selectedSeats.map(String);
                case 'fuels':
                    return selectedFuels;
                case 'motions':
                    return selectedMotions;
                default:
                    return [];
            }
        };

        const isSelected = (categoryKey: string, option: string) => selectedOptions(categoryKey).includes(option);



        return (
            <Modal visible={openModal} animationType="slide" >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            onPress={() => setOpenModal(false)}
                            style={styles.modalCloseButton}
                        >
                            <Text style={styles.modalCloseButtonText}>X</Text>
                        </TouchableOpacity>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.key}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleOptionSelect(item.key)}>
                                    <Text style={[styles.optionText, isSelected(selectedCategory.key, item.key) && styles.selectedOption]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        // ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />

                    </View>
                </View>
            </Modal>
        );
    };
    const hasSelections = (categoryKey: any) => {
        switch (categoryKey) {
            case 'brands':
                return selectedBrands.length > 0;
            case 'seats':
                return selectedSeats.length > 0;
            case 'fuels':
                return selectedFuels.length > 0;
            case 'motions':
                return selectedMotions.length > 0;
            default:
                return false;
        }
    };

    return (

        <View style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <ScrollView>
                    {/* Search bar */}
                    <View style={styles.searchBar}>
                        <TouchableOpacity onPress={() => router.replace('/')}>
                            {/* <Image style={styles.backButton} source={require('../assets/arrow_back.png')} /> */}
                            <TabBarIcon name='arrow-left' size={30} style={{ marginRight: 5 }} />
                        </TouchableOpacity>
                        <View style={styles.searchInput}>
                            <View style={{ flexDirection: 'row', marginBottom: 15, justifyContent: 'flex-start' }}>
                                <Text style={{ fontWeight: '600', marginTop: 10, marginLeft: 5 }}>Nhận xe:</Text>
                                <DateTimePicker
                                    value={parsedStartDate}
                                    mode="datetime"
                                    display="default"
                                    onChange={handleStartDateChange as any}
                                    minimumDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
                                    locale="vi"
                                />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                <Text style={{ fontWeight: '600', marginTop: 5, marginLeft: 5 }}>Trả xe:    </Text>
                                <DateTimePicker
                                    value={parsedEndDate}
                                    mode="datetime"
                                    display="default"
                                    onChange={handleEndDateChange as any}
                                    minimumDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
                                    locale="vi"
                                />
                            </View>
                            {/* <Image style={styles.searchIcon} source={require('../assets/search.png')} /> */}
                        </View>
                    </View>

                    {/* Category bar */}
                    <ScrollView contentContainerStyle={styles.categoryBar} horizontal showsHorizontalScrollIndicator={false}>
                        {categories.map(category => (
                            <TouchableOpacity
                                key={category.key}
                                onPress={() => handleCategoryPress(category as any)}
                                style={[
                                    styles.categoryItem,
                                    hasSelections(category.key) ? styles.selectedCategoryItem : null
                                ]}
                            >
                                {/* <View style={styles.categoryIcon}>{category.icon}</View> */}
                                <Image source={category.img} style={styles.categoryIcon} />
                                <Text style={styles.categoryLabel}>{category.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>



                    {/* Car list */}
                    <View style={styles.carListContainer}>
                        {carList.length > 0 ? (
                            carList.map((car) => (
                                <TouchableOpacity
                                    key={car.id}
                                    onPress={() =>
                                        router.push({ pathname: "/detail", params: { carId: car.id, startDate: startDate, endDate: endDate } })
                                    }
                                    style={styles.carItem}
                                >
                                    <Image source={{ uri: car.images[0] }} style={styles.carImage} />
                                    <View style={styles.carDetails}>
                                        <Text style={styles.carName}>
                                            {car.car_model.brand} {car.car_model.model} {car.car_model.year}
                                        </Text>
                                        <View style={styles.carFooter}>
                                            <View style={styles.starContainer}>
                                                {/* <Image source={require('../assets/star.png')} style={styles.starIcon} /> */}
                                                <TabBarIcon name='star' color='#F4CE14' size={24} style={{ marginRight: 6, }} />
                                                <Text style={styles.rating}>{car.rating}</Text>
                                            </View>
                                            <View style={styles.tripContainer}>
                                                {/* <Image source={require('../assets/completeTrip.png')} style={styles.tripIcon} /> */}
                                                <TabBarIcon name='history' color='green' size={24} style={{ marginRight: 6, }} />
                                                <Text style={styles.tripCount}>{car.total_trip} chuyến</Text>
                                            </View>
                                        </View>
                                        <Divider style={{ marginTop: 15 }} />
                                        <View style={{ marginTop: 10, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                            <Text style={styles.carPrice}>{car.price.toLocaleString('en-US')} VNĐ / ngày</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={{ paddingHorizontal: 15, paddingTop: 20 }}>
                                <Text style={{ color: '#B4B4B8' }}>Không tìm thấy chiếc xe nào phù hợp với yêu cầu</Text>
                            </View>
                        )}
                    </View>

                </ScrollView>

                {/* Open model */}
                {renderModalContent()}
            </SafeAreaView>
        </View>

    );
}

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        marginHorizontal: 13,
        marginVertical: 15,
        alignItems: 'center',
    },
    backButton: {
        marginRight: 10,
        width: 35,
        height: 35,
        marginTop: 8,
    },
    searchInput: {
        flex: 1,
        flexDirection: 'column',
        // justifyContent: 'flex-start',
        // alignItems: 'flex-start',
        height: 120,
        backgroundColor: '#EBEAEA',
        // borderWidth: 1,
        padding: 15,
        borderRadius: 10,
    },
    searchText: {
        fontWeight: 'bold',
    },
    searchIcon: {
        width: 22,
        height: 22,
    },

    categoryBar: {
        paddingHorizontal: 18,
        paddingVertical: 5,
        flexDirection: 'row',
    },
    categoryItem: {
        width: 100,
        paddingVertical: 10,
        paddingHorizontal: 3,
        borderRadius: 12,
        flexDirection: 'column',
        alignItems: 'center',
        marginHorizontal: 6,
        backgroundColor: 'white',
        borderColor: '#DADADA',
        borderWidth: 1,
    },
    selectedCategoryItem: {
        borderColor: '#773BFF',
        borderWidth: 1,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        marginBottom: 5,

    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    carListContainer: {
        paddingHorizontal: 24,
        marginVertical: 20,
    },
    carItem: {
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    carImage: {
        width: '100%',
        height: 160,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    carDetails: {
        padding: 18,
    },
    carName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#232425',
    },
    carPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#5457FB',
    },
    carFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 25,
        // marginBottom: 10
    },
    starIcon: {
        width: 15,
        height: 15,
        marginRight: 6,
    },
    rating: {
        fontSize: 14,
        fontWeight: '500',
        color: '#232425',
    },
    tripContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tripIcon: {
        width: 15,
        height: 15,
        marginRight: 6,
    },
    tripCount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#232425',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        width: "100%",
        height: "75%",
        backgroundColor: "white",
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingHorizontal: 100,
        paddingVertical: 50,
        alignItems: "center",
    },
    optionText: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        fontSize: 16,
        textAlign: 'center',
    },
    selectedOption: {
        backgroundColor: '#EFEFEF',
        width: '100%'
    },
    separator: {
        height: 1,
        backgroundColor: '#EFEFEF',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#773BFF',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalCloseButton: {
        position: "absolute",
        top: 20,
        right: 30,
        backgroundColor: "white",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    modalCloseButtonText: {
        color: "black",
        fontWeight: "bold",
        fontSize: 25,
    },
});

export default ListProductScreen;