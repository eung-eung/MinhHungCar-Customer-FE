import { View, Text, SafeAreaView, Alert, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Modal, TextInput } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthConText } from '@/store/AuthContext';
import axios from 'axios';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Divider } from 'react-native-paper';
import { AnimatedKeyboardOptions } from 'react-native-reanimated';

interface Trip {
    id: number;
    car_id: number;
    start_date: string;
    end_date: string;
    status: string;
    reason: string;
    rent_price: number;
    insurance_amount: number;
    collateral_cash_amount: number;
    collateral_type: string;
    feedback_content: string;
    feedback_rating: number;
    feedback_status: string;
    updated_at: string;
    url: string;
    car: {
        car_model: {
            based_price: number;
            brand: string;
            id: number;
            year: number;
        };
        car_model_id: number;
        description: string;
        fuel: string;
        id: number;
        license_plate: string;
        status: string;
        updated_at: string;
    };
}

interface Car {
    id: number;
    car_model: {
        brand: string;
        model: string;
        year: number;
        id: number;
        updated_at: string;
    };
    license_plate: string;
    images: string[];
    rating: number;
    total_trip: number;
    description: string;
    status: string;
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'ordered':
            return { borderColor: '#F4BB4C', color: '#F4BB4C' };
        case 'renting':
            return { borderColor: '#24D02B', color: '#24D02B' };
        case 'completed':
            return { borderColor: '#15891A', color: '#15891A' };
        default:
            return {};
    }
};

const statusConvert: Record<string, string> = {
    ordered: 'Đã đặt',
    renting: 'Đang thuê',
    completed: 'Hoàn thành',
};

export default function detailTrip() {
    const router = useRouter();
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    const params = useLocalSearchParams();
    const { contractID, tripStatus } = params;

    const contractIDNumber = contractID ? Number(contractID) : 0;

    const [detailTrip, setDetailTrip] = useState<Trip | undefined>();
    const [carDetail, setCarDetail] = useState<Car>();
    const [totalPrice, setTotalPrice] = useState<number>();

    const [content, setContent] = useState<string>('');
    const [rating, setRating] = useState<number>();

    const [isLoading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        getDetailTrip();
    }, []);

    const getDetailTrip = async () => {
        try {
            const response = await axios.get(`https://minhhungcar.xyz/customer/activities?status=${tripStatus}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const trips: Trip[] = response.data.data; // Ensure trips is typed as an array of Trip objects
            console.log('Fetch trip list success: ', trips);

            const detail: Trip | undefined = trips.find((trip: Trip) => trip.id === contractIDNumber); // Explicitly type detail as Trip | undefined
            console.log('detailTrip: ', detail);

            if (detail) {
                setDetailTrip(detail);

                if (detail.feedback_content !== null) {
                    setContent(detail.feedback_content);
                }
                if (detail.feedback_rating !== null) {
                    setRating(detail.feedback_rating)
                }

                const totalPrice = detail.rent_price + detail.insurance_amount;
                setTotalPrice(totalPrice);

                const carResponse = await axios.get(`https://minhhungcar.xyz/car/${detail.car_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const detailCar = carResponse.data.data;
                console.log('detailCar: ', detailCar);
                setCarDetail(detailCar);
            }
        } catch (error: any) {
            if (error.response.data.error_code === 10066) {
                console.log('Error get activities: ', error.response.data.message);
                Alert.alert('', 'Không thể xem chi tiết chuyến đi lúc này', [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]);
            } else {
                Alert.alert('', 'Có vài lỗi xảy ra. Vui lòng thử lại sau!');
                console.log('Error get activities: ', error.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const giveFeedback = async () => {
        try {
            const response = await axios.put(`https://minhhungcar.xyz/customer/feedback`, {
                customer_contract_id: contractIDNumber,
                content: content,
                rating: rating,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Give feedback successfully');
            Alert.alert('', 'Đánh giá của bạn đã được gửi');
            setModalVisible(false);
        } catch (error: any) {
            if (error.response.data.error_code === 10067) {
                console.log('Error: ', error.response.data.message);
                Alert.alert('', 'Đánh giá không thành công. Vui lòng thử lại sau!');
            } else {
                Alert.alert('', 'Có vài lỗi xảy ra. Vui lòng thử lại sau!')
                console.log("Error give feedback: ", error.response.data.message)
            }

        }
    };
    const handleRatingChange = (value: number) => {
        setRating(value);
    };

    const handleContentChange = (text: string) => {
        setContent(text);
    };

    const renderProgressLine = () => {
        return (
            <View style={styles.progressLine}>
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={[styles.progressStep, detailTrip?.status === 'ordered' && styles.progressStepActive]}>
                    </View>
                    <Text style={styles.progressStepText}>Đã đặt</Text>
                </View>
                <View style={[styles.progressConnector, detailTrip?.status === 'renting' && styles.progressConnectorActive]} />
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={[styles.progressStep, detailTrip?.status === 'renting' && styles.progressStepActive]}>
                    </View>
                    <Text style={styles.progressStepText}>Đang thuê</Text>
                </View>
                <View style={[styles.progressConnector, detailTrip?.status === 'completed' && styles.progressConnectorActive]} />
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={[styles.progressStep, detailTrip?.status === 'completed' && styles.progressStepActive]}>
                    </View>
                    <Text style={styles.progressStepText}>Hoàn thành</Text>
                </View>
            </View>
        );
    };



    return (
        <GestureHandlerRootView>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                        <View style={styles.container}>
                            {/* Progress line */}
                            {renderProgressLine()}

                            {/* Car information */}
                            <View>
                                <View style={styles.card}>
                                    <Image
                                        resizeMode="cover"
                                        source={{ uri: carDetail?.images && carDetail?.images.length > 0 ? carDetail?.images[0] : undefined }}
                                        style={styles.cardImg}
                                    />
                                    <View style={styles.cardBody}>
                                        <Text style={styles.cardTag}>Biển số xe: {carDetail?.license_plate}</Text>
                                        <Text style={styles.cardTitle}>{carDetail?.car_model.brand + ' ' + carDetail?.car_model.model + ' ' + carDetail?.car_model.year}</Text>
                                        <View style={styles.cardRow}>
                                            <View style={styles.cardRowItem}>
                                                <TabBarIcon name='star' size={24} color='#F4CE14' style={{ marginRight: 6 }} />
                                                <Text style={styles.cardRowItemText}>{carDetail?.rating}</Text>
                                            </View>
                                            <View>
                                                <View >
                                                    <Text style={{ color: getStatusStyles(detailTrip?.status || '').color, fontWeight: 'bold' }}>
                                                        {statusConvert[detailTrip?.status || '']}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginHorizontal: 25 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        router.push({ pathname: '/contract', params: { contractID } });
                                    }}
                                    style={styles.button}
                                >
                                    <Text style={{ color: 'white' }}>Xem hợp đồng</Text>
                                </TouchableOpacity>
                                {detailTrip?.status === 'completed' && (
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(true)}
                                        style={styles.button_2}
                                    >
                                        {(detailTrip?.feedback_rating === null && detailTrip?.feedback_content === null) ?
                                            <Text style={{ color: '#773BFF' }}>Đánh giá</Text>
                                            :
                                            <Text style={{ color: '#773BFF' }}>Sửa đánh giá</Text>
                                        }
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Payment */}
                            <Divider style={{ marginVertical: 15 }} />
                            <View style={{ marginHorizontal: 25, marginVertical: 20 }}>
                                <View style={styles.paymentItem}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Thành tiền</Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{totalPrice !== undefined ? `${totalPrice.toLocaleString()} VNĐ` : '-'} </Text>
                                </View>
                                <View style={styles.paymentItem}>
                                    <Text style={{ fontSize: 14 }}>Phí thuê xe</Text>
                                    <Text style={{ fontSize: 14 }}>{detailTrip?.rent_price !== undefined ? `${detailTrip.rent_price.toLocaleString()} VNĐ` : '-'}</Text>
                                </View>
                                <View style={styles.paymentItem}>
                                    <Text style={{ fontSize: 14 }}>Bảo hiểm thuê xe</Text>
                                    <Text style={{ fontSize: 14 }}>{detailTrip?.insurance_amount !== undefined ? `${detailTrip.insurance_amount.toLocaleString()} VNĐ` : '-'}</Text>
                                </View>
                                <View style={styles.paymentItem}>
                                    <Text style={{ fontSize: 14 }}>Phí sửa chữa xe</Text>
                                    <Text style={{ fontSize: 14 }}>500.000 VNĐ</Text>
                                </View>
                                <View style={styles.paymentItem}>
                                    <Text style={{ fontSize: 14 }}>Phí sửa chữa xe</Text>
                                    <Text style={{ fontSize: 14 }}>800.000 VNĐ</Text>
                                </View>

                            </View>

                        </View>
                        {detailTrip?.status === 'completed' && (
                            <TouchableOpacity
                                onPress={() => {
                                    // Add your logic for handling payment action
                                }}
                                style={styles.payButton}
                            >
                                <Text style={{ color: 'white' }}>Thanh toán</Text>
                            </TouchableOpacity>
                        )}
                        {/* Modal for feedback */}
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={modalVisible}
                            onRequestClose={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <TouchableOpacity
                                        style={styles.modalCloseButton}
                                        onPress={() => setModalVisible(!modalVisible)}
                                    >
                                        <Text style={styles.modalCloseButtonText}>X</Text>
                                    </TouchableOpacity>
                                    <View style={styles.modalInnerContent}>
                                        <Text style={styles.modalTitle}>Đánh giá chuyến đi</Text>
                                        <View style={styles.ratingContainer}>
                                            {[1, 2, 3, 4, 5].map((index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[
                                                        styles.ratingStar,
                                                        rating! >= index ? styles.ratingStarSelected : {},
                                                    ]}
                                                    onPress={() => handleRatingChange(index)}
                                                >
                                                    <TabBarIcon
                                                        name='star'
                                                        size={24}
                                                        color={rating! >= index ? '#F4CE14' : '#d3d3d3'}
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <TextInput
                                            style={styles.feedbackInput}
                                            placeholder="Nhập nội dung đánh giá..."
                                            onChangeText={handleContentChange}
                                            value={content}
                                            multiline
                                        />
                                        <TouchableOpacity onPress={giveFeedback} style={styles.submitButton}>
                                            {(detailTrip?.feedback_rating === null && detailTrip?.feedback_content === null) ?
                                                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                                                :
                                                <Text style={styles.submitButtonText}>Sửa đánh giá</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </ScrollView>
                </SafeAreaView>
            )}
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        textTransform: 'uppercase',
    },
    cardTitle: {
        fontSize: 18,
        color: '#000',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardRowItemText: {
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        padding: 12,
        backgroundColor: '#773BFF',
        borderRadius: 12,
        alignItems: 'center',
        marginLeft: 8,
    },
    button_2: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderColor: '#773BFF',
        borderRadius: 12,
        alignItems: 'center',
        marginLeft: 8,
        borderWidth: 1,
    },
    paymentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    statusContainer: {
        borderWidth: 1,
        padding: 6,
        borderRadius: 10,
        alignItems: 'center',
    },
    progressLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 25,
        marginTop: 10,
        marginBottom: 20,
        height: 80,
    },
    progressStep: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#CCCCCC',
    },
    progressStepActive: {
        backgroundColor: 'green',
    },
    progressConnector: {
        flex: 1,
        height: 2,
        backgroundColor: '#CCCCCC',
        marginTop: 20,
    },
    progressConnectorActive: {
        backgroundColor: 'black',
    },
    progressStepText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 18,
    },
    payButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#80AF81',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxHeight: '80%',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },
    modalCloseButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalInnerContent: {
        marginTop: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    ratingStar: {
        paddingHorizontal: 5,
    },
    ratingStarSelected: {
        transform: [{ scale: 1.2 }],
    },
    feedbackInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 10,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#773BFF',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
    },
});
