import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, StatusBar, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Divider } from 'react-native-paper';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { AuthConText } from '@/store/AuthContext';
import { useRouter } from 'expo-router';

interface Trip {
    id: number;
    start_date: string;
    end_date: string;
    status: string;
    car: {
        car_model: {
            brand: string;
            model: string;
            year: string;
        };
        license_plate: string;
    };
    rent_price: number;
    updated_at: string;
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'no_filter':
            return { borderColor: '#F89F36', color: '#F89F36' };
        case 'waiting_contract_payment':
            return { borderColor: '#56AEFF', color: '#56AEFF' };
        case 'waiting_for_agreement':
            return { borderColor: 'gray', color: 'gray' };
        case 'ordered':
            return { borderColor: '#F4BB4C', color: '#F4BB4C' };
        case 'renting':
            return { borderColor: '#24D02B', color: '#24D02B' };
        case 'completed':
            return { borderColor: '#15891A', color: '#15891A' };
        case 'canceled':
            return { borderColor: 'red', color: 'red' };
        default:
            return {};
    }
};

const statusConvert: Record<string, string> = {
    no_filter: 'Tất cả',
    waiting_for_agreement: 'Chờ chấp thuận',
    waiting_contract_payment: 'Chờ thanh toán',
    ordered: 'Đã đặt',
    renting: 'Đang thuê',
    completed: 'Hoàn thành',
    canceled: 'Đã hủy',
};

const HistoryScreen: React.FC = () => {
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    const router = useRouter();

    const [activeTab, setActiveTab] = useState<string>('no_filter');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [trip, setTrip] = useState<Trip[]>([]);
    const [page, setPage] = useState<number>(1);
    const isFocused = useIsFocused();

    useEffect(() => {
        getAllContract();
    }, [activeTab, page, isFocused]);

    useFocusEffect(
        useCallback(() => {
            getAllContract();
        }, [activeTab, page, isFocused])
    );

    const getAllContract = async () => {
        const status = [activeTab];

        try {
            const response = await axios.get(`https://minhhungcar.xyz/customer/contracts?offset=${(page - 1) * 2}&limit=100&contract_status=${status.join(',')}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const contracts: Trip[] = response.data.data.sort((a: Trip, b: Trip) => b.id - a.id);
            setTrip(contracts);
            setIsLoading(false);
        } catch (error: any) {
            if (error.response?.data?.error_code === 10034) {
                Alert.alert('Lỗi', 'Không thể lấy danh sách hợp đồng');
            } else {
                console.log('Error: ', error.response?.data?.message);
            }
        }
    };


    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
        setPage(1); // Reset page when tab changes
    };

    const formatDate = (isoDateString: string) => {
        const date = new Date(isoDateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getLastPaymentDetail = async (contractID: number) => {
        try {
            const response = await axios.get(`https://minhhungcar.xyz/customer/last_payment_detail?customer_contract_id=${contractID}&payment_type=pre_pay`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const payment_url = response.data.data.payment_url;
            router.push({ pathname: '/paymentMethod', params: { payment_url } });
        } catch (error: any) {
            if (error.response?.data?.error_code === 10053) {
                Alert.alert('Lỗi', 'Không thể lấy được chi tiết thanh toán gần nhất');
            } else {
                console.log('Error paymentMethod: ', error.response?.data?.message);
            }
        }
    };

    const navigateToScreen = (trip: Trip) => {
        if (trip && trip.status === 'waiting_for_agreement') {
            router.push({ pathname: '/contract', params: { contractID: trip.id } });
        } else if (trip && trip.status === 'waiting_contract_payment') {
            console.log('waiting_contract_payment:', trip.status)
            getLastPaymentDetail(trip.id);
        } else if (trip && trip.status === 'canceled') {
            return;
        } else if (trip) {
            router.push({ pathname: '/detailTrip', params: { contractID: trip.id, tripStatus: trip.status } });
        }
    };

    const renderItem = ({ item }: { item: Trip }) => {
        const formattedStartDate = formatDate(item.start_date);
        const formattedEndDate = formatDate(item.end_date);

        return (
            <TouchableOpacity onPress={() => navigateToScreen(item)}>
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <Text style={{ fontWeight: '600' }}>{formattedStartDate}</Text>
                            <Text style={{ fontWeight: 'bold', marginHorizontal: 5 }}>→</Text>
                            <Text style={{ fontWeight: '600' }}>{formattedEndDate}</Text>
                        </View>
                        <View style={[styles.statusContainer, getStatusStyles(item.status)]}>
                            <Text style={{ color: getStatusStyles(item.status).color, fontWeight: 'bold' }}>{statusConvert[item.status]}</Text>
                        </View>
                    </View>
                    <Divider style={{ marginBottom: 10, marginTop: -5 }} />
                    <View>
                        <View style={styles.cardBody}>
                            <Text style={styles.cardTitle}>{item.car.car_model.brand} {item.car.car_model.model} {item.car.car_model.year}</Text>
                            <Text style={styles.cardTag}>Biển số xe: {item.car.license_plate}</Text>
                        </View>
                        <Text style={{ fontWeight: '700', color: 'red', textAlign: 'right' }}>Thành tiền: {item.rent_price.toLocaleString()} VNĐ </Text>
                        <View>
                            {(item.status === 'waiting_contract_payment' || item.status === 'ordered' || item.status === 'renting' || item.status === 'completed') && (
                                <TouchableOpacity onPress={() => { router.push({ pathname: '/contract', params: { contractID: item.id } }) }} style={[styles.button, { alignSelf: 'flex-end', marginTop: 10 }]}>
                                    <Text style={{ color: 'white', fontSize: 14 }}>Xem hợp đồng</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        return isLoading ? (
            <View style={styles.loaderStyle}>
                <ActivityIndicator size="large" color="#aaa" />
            </View>
        ) : (
            <></>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    {/* Tab */}
                    <View style={styles.tabContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
                            {Object.keys(statusConvert).map((statusKey) => (
                                <TouchableOpacity
                                    key={statusKey}
                                    style={[styles.tabItem, activeTab === statusKey && styles.activeTabItem]}
                                    onPress={() => handleTabPress(statusKey)}
                                >
                                    <Text style={[styles.tabText, activeTab === statusKey && styles.activeTabItem]}>{statusConvert[statusKey]}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Card */}
                    {trip.length > 0 ? (
                        <FlatList
                            data={trip}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            ListFooterComponent={renderFooter}
                            onEndReached={!isLoading ? getAllContract : undefined}
                            onEndReachedThreshold={0.5}
                            contentContainerStyle={styles.container} // Replace listContainer with container
                        />
                    ) : (
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                            <Text style={{ fontSize: 16, color: '#686D76', marginBottom: 20 }}>Chưa có chuyến nào {statusConvert[activeTab]}</Text>
                        </View>
                    )}

                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
        marginVertical: 80
    },
    card: {
        marginBottom: 10,
        backgroundColor: '#fff',
        paddingVertical: 20,
        paddingHorizontal: 25,
        height: 'auto',
    },
    cardBody: {
        flex: 1,
        marginBottom: 12,
    },
    cardTag: {
        fontSize: 13,
        color: '#939393',
        textTransform: 'uppercase',
    },
    cardTitle: {
        fontSize: 18,
        color: '#000',
        marginBottom: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    tabContainer: {
        height: 60,
        backgroundColor: 'white',
        marginBottom: 10,
    },
    scrollViewContent: {
        paddingHorizontal: 25,
    },
    tabItem: {
        height: 60,
        justifyContent: 'center',
        marginRight: 25,
    },
    activeTabItem: {
        borderBottomColor: '#773BFF',
        borderBottomWidth: 3,
    },
    tabText: {
        fontSize: 16,
        color: 'black',
    },
    statusContainer: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
    },
    button: {
        width: 150,
        height: 30,
        backgroundColor: '#773BFF',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderStyle: {
        marginTop: 10,
        alignItems: 'center',
    },
});

export default HistoryScreen;
