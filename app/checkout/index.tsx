import React, { useContext, useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Image, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { Divider } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthConText } from '@/store/AuthContext';
import { apiCar, apiDocument, apiPayment } from '@/api/apiConfig';
import LoadingOverlay from '@/components/LoadingOverlay';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';




interface CarDetail {
    images: string[];
    license_plate: string;
    car_model: {
        brand: string;
        model: string;
        year: number;
    };
}


const CheckoutScreen: React.FC = () => {
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;
    const route = useRouter();
    const params = useLocalSearchParams()
    const { carId, startDate, endDate } = params;

    const carIdNumber = carId ? Number(carId) : 0;


    const [carDetail, setCarDetail] = useState<CarDetail>({ images: [], license_plate: '', car_model: { brand: '', model: '', year: 0 } });
    const [isLoading, setLoading] = useState(true);
    const [parsedStartDate, setParsedStartDate] = useState<Date>(new Date());
    const [parsedEndDate, setParsedEndDate] = useState<Date>(new Date());
    const [contractID, setContractID] = useState<number | string>('');
    const [rentPricePerDay, setRentPricePerDay] = useState<number>(0);
    const [selectedCollateral, setSelectedCollateral] = useState<'cash' | 'motorbike'>('cash');
    const [insurancePricePerDay, setInsurancePricePerDay] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [prepaid, setPrepaid] = useState(0);
    const [payDirect, setPayDirect] = useState(0);
    const [isLoadingPrice, setLoadingPrice] = useState(true);


    const [isHaveLicense, setIsHaveLicense] = useState(false)

    useEffect(() => {
        if (startDate && endDate) {
            setParsedStartDate(new Date(startDate as any));
            setParsedEndDate(new Date(endDate as any));
        }
    }, [startDate, endDate]);

    useEffect(() => {
        getCarDetail();
    }, [carId]);

    useEffect(() => {
        getLicenseInfo()
    }, [])

    useEffect(() => {
        if (parsedStartDate && parsedEndDate) {
            calculatePricing();
        }
    });

    useEffect(() => {
        if (contractID) {
            route.push({ pathname: "/contract", params: { contractID: contractID } })

        }
    }, [contractID]);

    const getCarDetail = async () => {
        try {
            const response = await axios.get(`https://minhhungcar.xyz/car/${carId}`);
            setCarDetail(response.data.data);
            console.log('Fetch successfully: ', response.data.message)
            setLoading(false);
        } catch (error: any) {
            if (error.response.data.error_code === 10027) {
                Alert.alert('Lỗi', 'Không thể xem được chi tiết xe lúc này. Vui lòng thử lại sau!')
            } else {
                console.log("Error: ", error.response.data.message)
            }
        }
    };

    const getLicenseInfo = async () => {
        try {
            const response = await axios.get(apiDocument.getDrivingLicenseImage, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const error_code = response.data.error_code;
            if (error_code === 10000) {
                setIsHaveLicense(true);
            } else {
                setIsHaveLicense(false);
                console.log('No data returned for driving license info.');
            }
            setLoading(false);
        } catch (error: any) {
            console.log('Fetch info failed: ', error.response?.data?.message);
            setLoading(false);
        }
    };

    const rentCar = async () => {
        if (!isHaveLicense) {
            Alert.alert(
                'Yêu cầu cập nhật',
                'Bạn chưa cập nhật giấy phép lái xe. Tiến hành cập nhật ngay!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            route.push('/drivingLicense');
                        },
                    },
                    {
                        text: 'Hủy',
                        style: 'cancel',
                    },
                ]
            );
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                apiCar.rentCar,
                {
                    car_id: carIdNumber,
                    start_date: parsedStartDate.toISOString(),
                    end_date: parsedEndDate.toISOString(),
                    collateral_type: selectedCollateral,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const id = response.data.data.id;
            setContractID(id - 1);
            setLoading(false);
        } catch (error: any) {
            if (error.response?.data?.error_code === 10049) {
                Alert.alert('Không thể thuê xe', 'Vui lòng thử lại sau');
                console.log('Error renting car: ', error.response?.data?.message);
            } else if (error.response?.data?.error_code === 10068) {
                Alert.alert(
                    'Yêu cầu cập nhật',
                    'Bạn chưa cập nhật thông tin thanh toán. Tiến hành cập nhật ngay!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                route.push('/payInfo');
                            },
                        },
                        {
                            text: 'Hủy',
                            style: 'cancel',
                        },
                    ]
                );
            } else {
                console.log('Error: ', error.response?.data?.message);
            }
            setLoading(false);
        }
    };

    const calculatePricing = async () => {
        if (!parsedStartDate || !parsedEndDate) return;
        try {
            const response = await axios.get(
                `https://minhhungcar.xyz/customer/calculate_rent_pricing?car_id=${carId}&start_date=${parsedStartDate.toISOString()}&end_date=${parsedEndDate.toISOString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const { rent_price_quotation, insurance_price_quotation, total_amount, prepaid_amount } = response.data.data;
            setRentPricePerDay(rent_price_quotation);
            setInsurancePricePerDay(insurance_price_quotation);
            setTotalPrice(total_amount);
            setPrepaid(prepaid_amount);
            setPayDirect(total_amount - prepaid_amount);
            setLoadingPrice(false);
        } catch (error: any) {
            if (error.response?.data?.error_code === 10052) {
                Alert.alert('Pricing Error', 'Please try again later');
            } else {
                console.log('Lỗi: ', error.response?.data?.message);
            }
        }
    };

    const handleStartDateChange = (event: Event, selectedDate?: Date) => {
        const currentDate = selectedDate || parsedStartDate;
        const minDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // Minimum start date, 2 hours from now

        if (currentDate < minDate) {
            Alert.alert('', 'Car pick-up time must be at least 2 hours from now');
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
            Alert.alert('', 'End date must be at least 1 day after start date');
        } else {
            if (currentDate.getTime() - (parsedStartDate || new Date()).getTime() < 24 * 60 * 60 * 1000) {
                Alert.alert('', 'Minimum rental period is 1 day');
            } else {
                setParsedEndDate(currentDate);
            }
        }
    };

    const handleOptionSelect = (option: 'cash' | 'motorbike') => {
        setSelectedCollateral(option);
    };

    const handleRent = async () => {
        await rentCar();
    };

    return (
        <GestureHandlerRootView>
            <View style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" />
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <LoadingOverlay message='' />
                    </View>
                ) : (
                    <>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                                <View style={styles.container}>
                                    <View style={styles.card}>
                                        <Image
                                            resizeMode="cover"
                                            source={{ uri: carDetail.images[0] }}
                                            style={styles.cardImg}
                                        />
                                        <View style={styles.cardBody}>
                                            <Text style={styles.cardTag}>Biển số xe: {carDetail.license_plate}</Text>
                                            <Text style={styles.cardTitle}>{carDetail.car_model.brand + ' ' + carDetail.car_model.model + ' ' + carDetail.car_model.year}</Text>
                                            <View style={styles.cardRow}>
                                                <View style={styles.cardRowItem}>
                                                    {/* <Image
                                                        source={require('../assets/star.png')}
                                                        style={styles.cardRowItemImg}
                                                    /> */}
                                                    <TabBarIcon name='star' size={24} color='#F4CE14' style={{ marginRight: 6 }} />
                                                    <Text style={styles.cardRowItemText}>5</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    <Divider />

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Thông tin thuê xe</Text>
                                        <View style={styles.row}>
                                            <View style={styles.rowItem}>
                                                <TabBarIcon name='calendar-clock' color='#6D6D6D' size={24} style={{ marginRight: 5 }} />

                                                <View>
                                                    <Text style={styles.label}>Nhận xe</Text>
                                                    <View
                                                        style={{
                                                            marginTop: 15,
                                                            flexDirection: 'row',
                                                            marginLeft: -70
                                                        }}
                                                    >
                                                        <DateTimePicker
                                                            value={parsedStartDate}
                                                            mode="datetime"
                                                            display="default"
                                                            onChange={handleStartDateChange as any}
                                                            minimumDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
                                                            locale="vi"
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.rowItem}>
                                                <TabBarIcon name='calendar-clock' color='#6D6D6D' size={24} style={{ marginRight: 5 }} />
                                                <View>
                                                    <Text style={styles.label}>Trả xe</Text>
                                                    <View
                                                        style={{
                                                            marginLeft: -80,
                                                            marginTop: 15,
                                                            flexDirection: 'row'
                                                        }}
                                                    >
                                                        <DateTimePicker
                                                            value={parsedEndDate}
                                                            mode="datetime"
                                                            display="default"
                                                            onChange={handleEndDateChange as any}
                                                            minimumDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
                                                            locale="vi"
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        <View>
                                            <View style={{ marginTop: 20 }}>
                                                <View style={{ flexDirection: 'row' }}>

                                                    {/* <Image style={{ width: 18, height: 18, marginRight: 5 }} source={require('../assets/location_grey.png')} /> */}
                                                    <TabBarIcon name='map-marker-outline' size={24} color='#6C6C6C' style={{ marginRight: 5 }} />
                                                    <View >
                                                        <Text style={styles.label}>Nhận xe tại địa chỉ</Text>

                                                        <Text style={styles.value}>FPT University</Text>
                                                    </View>
                                                </View>

                                            </View>
                                        </View>
                                    </View>

                                    <Divider />

                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Loại thế chấp</Text>
                                        {/* <View style={styles.row}> */}

                                        <View style={styles.radioContainer}>
                                            <TouchableOpacity
                                                style={styles.radioButtonContainer}
                                                onPress={() => handleOptionSelect('cash')}
                                            >
                                                <View style={[styles.radioButton, selectedCollateral === 'cash' && styles.radioButtonSelected]}>
                                                    {selectedCollateral === 'cash' && <View style={styles.radioButtonInner} />}
                                                </View>
                                                <Text style={styles.radioButtonText}>Tiền mặt</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.radioButtonContainer}
                                                onPress={() => handleOptionSelect('motorbike')}
                                            >
                                                <View style={[styles.radioButton, selectedCollateral === 'motorbike' && styles.radioButtonSelected]}>
                                                    {selectedCollateral === 'motorbike' && <View style={styles.radioButtonInner} />}
                                                </View>
                                                <Text style={styles.radioButtonText}>Xe máy và giấy tờ xe</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {/* </View>  */}
                                    </View>

                                    <View style={styles.priceContainer}>
                                        <Text style={{ fontSize: 20, marginBottom: 20, fontWeight: 'bold', marginHorizontal: 25, marginVertical: 20 }}>Bảng tính giá</Text>
                                        {isLoadingPrice ? (
                                            <View style={styles.loadingContainer}>
                                                <ActivityIndicator />
                                            </View>
                                        ) : (
                                            <View style={styles.price}>
                                                <View style={styles.priceDetail}>
                                                    <Text style={styles.priceTitle}>Đơn giá thuê</Text>
                                                    <Text style={styles.priceText}>{rentPricePerDay !== undefined ? rentPricePerDay.toLocaleString() : 'Loading...'} đ/ngày</Text>
                                                </View>
                                                <View style={styles.priceDetail}>
                                                    <Text style={styles.priceTitle}>Bảo hiểm thuê xe</Text>
                                                    <Text style={styles.priceText}>{insurancePricePerDay !== undefined ? rentPricePerDay.toLocaleString() : 'Loading...'} đ/ngày</Text>
                                                </View>
                                                <Divider style={styles.divider} />
                                                <View style={styles.priceDetail}>
                                                    <Text style={styles.priceTitleColor}>Thành tiền</Text>
                                                    <Text style={styles.priceTextColor}>{totalPrice !== undefined ? totalPrice.toLocaleString() : 'Loading...'} đ</Text>
                                                </View>
                                                <View style={styles.priceDetail}>
                                                    <Text style={styles.priceTitleColor}>Đặt cọc qua ứng dụng</Text>
                                                    <Text style={styles.priceTextColor}>{prepaid !== undefined ? prepaid.toLocaleString() : 'Loading...'} đ</Text>
                                                </View>
                                                <View style={styles.priceDetail}>
                                                    <Text style={styles.priceTitleColor}>Thanh toán khi nhận xe</Text>
                                                    <Text style={styles.priceTextColor}>{payDirect !== undefined ? payDirect.toLocaleString() : 'Loading...'} đ</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.requireContainer}>
                                        <Text style={styles.sectionTitle}>Giấy tờ thuê xe</Text>
                                        <View style={styles.require}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, marginLeft: 8, marginBottom: 8 }}>
                                                <TabBarIcon name='card-account-details-outline' size={30} />
                                                <Text style={styles.requireContent}> Xuất trình đầy đủ GPLX, CCCD (chụp hình đối chiếu) hoặc Hộ chiếu (passport) bản gốc giữ lại</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, marginLeft: 8 }}>
                                                <TabBarIcon name='currency-usd' size={35} />
                                                <Text style={styles.requireContent}>Tài sản thế chấp tiền mặt(15 triệu hoặc theo thỏa thuận) hoặc xe máy có giá trị tương đương 15 triệu trở lên (xe máy và cavet gốc) trước khi nhận xe.</Text>
                                            </View>
                                        </View>
                                    </View>

                                </View>
                            </ScrollView>
                        </SafeAreaView>

                        <View style={styles.overlay}>
                            <View style={styles.overlayContent}>
                                <View style={styles.overlayContentTop}>
                                    {/* <Switch
                            trackColor={{ false: '#6E6D6D', true: '#67C96B' }}
                            thumbColor={'#fff'}
                            ios_backgroundColor="#B8B8B8"
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                            style={styles.switch}
                        />
                        <Text style={styles.overlayContentPrice}>Tôi đồng ý với{' '}
                            <Text style={{color: '#15891A'}}>
                                Chính sách hủy chuyến của MinhHungCar
                            </Text>
                        </Text> */}
                                </View>

                            </View>

                            <TouchableOpacity
                                onPress={handleRent}>
                                <View style={styles.btn}>
                                    <Text style={styles.btnText}>Thuê xe</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewContent: {
        paddingBottom: 100,
    },
    container: {
        marginTop: 20,
        flex: 1,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: '#fff',
        marginHorizontal: 25,
    },
    cardImg: {
        width: 140,
        height: '100%',
        borderRadius: 12,
    },
    cardBody: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 5,
    },
    cardTag: {
        fontSize: 13,
        color: '#939393',
        marginBottom: 9,
        textTransform: 'uppercase'
    },
    cardTitle: {
        fontSize: 18,
        color: '#000',
        marginBottom: 8,
        fontWeight: 'bold'
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardRowItemImg: {
        width: 22,
        height: 22,
        borderRadius: 9999,
        marginRight: 6,
    },
    cardRowItemText: {
        fontSize: 13,
        color: '#000',
    },
    section: {
        marginTop: 20,
        marginBottom: 25,
        marginHorizontal: 25,
    },
    sectionTitle: {
        fontSize: 20,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5
    },
    rowItem: {
        flexDirection: 'row',
    },
    icon: {
        width: 18,
        height: 18,
        marginRight: 5,
    },
    label: {
        color: '#6C6C6C',
        fontSize: 14,
        fontWeight: '600'
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },
    priceContainer: {
        backgroundColor: '#F4F4F4',
        paddingBottom: 20,

    },
    price: {
        backgroundColor: '#fff',
        marginHorizontal: 25,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 15,
    },
    priceDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 11,
    },
    priceTitle: {
        color: '#8E8E8E',
        fontWeight: '600',
    },
    priceText: {
        color: '#5C5C5C',
        fontWeight: '600',
    },
    priceTitleColor: {
        color: 'black',
        fontWeight: '600',
    },
    priceTextColor: {
        color: '#5457FB',
        fontWeight: '600',
    },
    divider: {
        marginVertical: 8
    },
    requireContainer: {
        paddingHorizontal: 25,
        paddingVertical: 20,
        marginVertical: 10
    },
    require: {
        paddingHorizontal: 10,
    },
    requireContent: {
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 20,
        fontSize: 13,
        color: '#6E6D6D'
    },
    /** Overlay */
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 48,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3
    },
    overlayContent: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    overlayContentTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 2,
    },
    switch: {
        transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }]
    },
    overlayContentPrice: {
        fontSize: 11,
        lineHeight: 26,
        fontWeight: '600',
        color: 'grey',
    },
    /** Button */
    btn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: '#773BFF',
        borderColor: '#773BFF',
        marginTop: 10
    },
    btnText: {
        fontSize: 16,
        lineHeight: 26,
        fontWeight: '600',
        color: '#fff',
    },
    //Radio button
    radioContainer: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radioButton: {
        height: 18,
        width: 18,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioButtonSelected: {
        borderColor: '#773BFF',
    },
    radioButtonInner: {
        height: 10,
        width: 10,
        borderRadius: 6,
        backgroundColor: '#773BFF',
    },
    radioButtonText: {
        fontSize: 14,
        color: '#000',
    },
});

export default CheckoutScreen;
