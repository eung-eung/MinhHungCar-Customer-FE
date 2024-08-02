import React, { useContext, useState, useEffect } from 'react';
import {
    StyleSheet,
    Dimensions,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    ListRenderItemInfo,
} from 'react-native';
import { TabBarIcon } from './navigation/TabBarIcon';
import { AuthConText } from '@/store/AuthContext';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { apiCar } from '@/api/apiConfig';
import { Divider } from 'react-native-paper';

type Item = {
    id: number;
    car_model: {
        id: number;
        brand: string;
        model: string;
        year: string;
        number_of_seats: number;
    };
    license_plate: string;
    price: number;
    images: string[];
    rating: number;
    total_trip: number;
};

const CARD_WIDTH = Math.min(Dimensions.get('screen').width * 0.75, 400);

export default function CardCar() {
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;
    const router = useRouter();

    const [cars, setCars] = useState<Item[]>([]);

    useEffect(() => {
        getSuggestCar();
    }, []);

    const getSuggestCar = async () => {
        try {
            const response = await axios.get(apiCar.fetchSuggestCar, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCars(response.data.data);
            console.log("Fetch suggest car successfully: ", response.data.message);
        } catch (error: any) {
            console.log("Error fetch suggest car: ", error.response?.data?.message || error.message);
        }
    };

    const renderItem = ({ item }: ListRenderItemInfo<Item>) => {
        const parsedStartDate = new Date();
        parsedStartDate.setHours(parsedStartDate.getHours() + 2);

        const parsedEndDate = new Date(parsedStartDate);
        parsedEndDate.setHours(parsedEndDate.getHours() + 24);

        return (
            <TouchableOpacity
                onPress={() => {
                    router.push({
                        pathname: "/detail",
                        params: {
                            carId: item.id,
                            startDate: parsedStartDate.toISOString(),
                            endDate: parsedEndDate.toISOString(),
                        },
                    });
                }}
            >
                <View style={styles.carItem}>
                    <Image source={{ uri: item.images[0] }} style={styles.carImage} />
                    <View style={styles.carDetails}>
                        <Text
                            style={styles.carName}
                            numberOfLines={1}
                            ellipsizeMode='tail'
                        >
                            {item.car_model.brand} {item.car_model.model} {item.car_model.year}
                        </Text>
                        <View style={styles.carFooter}>
                            <View style={styles.starContainer}>
                                <TabBarIcon name="star" color="#F4CE14" size={24} style={{ marginRight: 6 }} />
                                <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
                            </View>
                            <View style={styles.tripContainer}>
                                <TabBarIcon name="history" color="green" size={24} style={{ marginRight: 6 }} />
                                <Text style={styles.tripCount}>{item.total_trip} chuyến</Text>
                            </View>
                        </View>
                        <Divider style={{ marginTop: 15 }} />
                        <View style={{ marginTop: 10, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                            <Text style={styles.carPrice}>{item.price.toLocaleString('en-US')} đ / ngày</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {cars.length > 0 ? (
                <FlatList
                    data={cars}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có xe phù hợp dành cho bạn</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 24,
    },
    scrollViewContent: {
        paddingHorizontal: 18,
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
        width: 320,
        marginRight: 12
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
    tripCount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#232425',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#B4B4B8',
    },
});
