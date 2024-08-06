import { View, Text, SafeAreaView, Alert, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Modal, TextInput } from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { AuthConText } from '@/store/AuthContext';
import axios from 'axios';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Divider, RadioButton } from 'react-native-paper';
import { CheckBox } from '@rneui/themed';
import { apiPayment } from '@/api/apiConfig';
import { useIsFocused } from '@react-navigation/native';
import { RefreshControl } from 'react-native';
import LoadingOverlay from '@/components/LoadingOverlay';

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

interface Payment {
    id: number;
    customer_contract_id: number;
    customer_contract: {
        id: number;
        car_id: number;
        collateral_type: string;
        collateral_cash_amount: number;
        is_return_collateral_asset: boolean;
    };
    payment_type: string;
    amount: number;
    note: string;
    status: string;
    payment_url: string;
    payer: string;
}

interface Collateral {
    id: number;
    insurance_percent: number;
    prepay_percent: number;
    collateral_cash_amount: number;
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'ordered':
            return { borderColor: '#F4BB4C', color: '#F4BB4C', borderWidth: 1, borderRadius: 50, padding: 4 };
        case 'renting':
            return { borderColor: '#24D02B', color: '#24D02B', borderWidth: 1, borderRadius: 50, padding: 4 };
        case 'completed':
            return { borderColor: '#15891A', color: '#15891A', borderWidth: 1, borderRadius: 50, padding: 4 };
        case 'canceled':
            return { borderColor: 'red', color: 'red', borderWidth: 1, borderRadius: 50, padding: 4 };
        default:
            return { borderColor: 'grey', color: 'grey', borderWidth: 1, borderRadius: 50, padding: 4 };
    }
};

const statusConvert: Record<string, string> = {
    ordered: 'Đã đặt',
    renting: 'Đang thuê',
    completed: 'Hoàn thành',
    canceled: 'Đã hủy'
};

const paymentTypeConvert: Record<string, string> = {
    pre_pay: 'Phí đặt cọc',
    remaining_pay: 'Phí còn lại',
    collateral_cash: 'Tiền mặt thế chấp',
    return_collateral_cash: 'Hoàn trả thế chấp',
    refund_pre_pay: 'Hoàn trả tiền cọc',
    other: 'Khác'
}

const collateralConvert: Record<string, string> = {
    cash: 'Tiền mặt',
    motorbike: 'Giấy tờ xe máy',
}

export default function detailTrip() {
    const router = useRouter();
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    const params = useLocalSearchParams();
    const { contractID, tripStatus } = params;

    const contractIDNumber = contractID ? Number(contractID) : 0;

    const [detailTrip, setDetailTrip] = useState<Trip | undefined>();
    const [carDetail, setCarDetail] = useState<Car>();

    const [content, setContent] = useState<string>('');
    const [rating, setRating] = useState<number>();

    const [modalVisible, setModalVisible] = useState(false);

    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedPaymentIds, setSelectedPaymentIds] = useState<number[]>([]);
    const [selectAllText, setSelectAllText] = useState<string>('Chọn tất cả');

    const [collateralType, setCollateralType] = useState<string>('');
    const [collateralAmount, setCollateralAmount] = useState<number>();
    const [returnCollateral, setReturnCollateral] = useState(false);

    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [collateralValue, setCollateralValue] = useState<Collateral>();
    const isFocus = useIsFocused()

    const [isLoading, setLoading] = useState(true);
    const [isDetailTripLoading, setDetailTripLoading] = useState(true);
    const [isContractPaymentLoading, setContractPaymentLoading] = useState(true);
    const [isCollateralLoading, setCollateralLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);



    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    await Promise.all([
                        getDetailTrip(),
                        getContractPayment(),
                        getCollateral(),
                    ]);
                } catch (error) {
                    // Handle error if needed
                } finally {
                    // Ensure loading state is set to false after all data is fetched
                    setDataLoaded(true);
                    setLoading(false);
                }
            };

            fetchData();
        }, [isFocus])
    );

    const getCollateral = async () => {
        setCollateralLoading(true);
        try {
            const response = await axios.get(apiPayment.getCollateral, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCollateralValue(response.data.data);
            console.log('Fetch getCollateral successfully: ', response.data.data);
        } catch (error: any) {
            console.log('Error getCollateral: ', error.response?.data?.message);
        } finally {
            setCollateralLoading(false);
        }
    };

    const getDetailTrip = async () => {
        setDetailTripLoading(true);
        try {
            const response = await axios.get('https://minhhungcar.xyz/customer/activities', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const trips: Trip[] = response.data.data;
            console.log('Fetch trip list success: ', response.data.message);

            const detail: Trip | undefined = trips.find(
                (trip: Trip) => trip.id === contractIDNumber
            );

            if (detail) {
                setDetailTrip(detail);

                if (detail.feedback_content !== null) {
                    setContent(detail.feedback_content);
                }
                if (detail.feedback_rating !== null) {
                    setRating(detail.feedback_rating);
                }

                const carResponse = await axios.get(`https://minhhungcar.xyz/car/${detail.car_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const detailCar = carResponse.data.data;
                console.log('detailCar: ', carResponse.data.message);
                setCarDetail(detailCar);
            }
        } catch (error: any) {
            if (error.response?.data?.error_code === 10066) {
                console.log('Error get activities: ', error.response?.data?.message);
                Alert.alert('', 'Không thể xem chi tiết chuyến đi lúc này', [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]);
            } else {
                Alert.alert('', 'Có vài lỗi xảy ra. Vui lòng thử lại sau!');
                console.log('Error get activities: ', error.response?.data?.message);
            }
        } finally {
            setDetailTripLoading(false);
        }
    };

    const getContractPayment = async () => {
        setContractPaymentLoading(true);
        try {
            const response = await axios.get(
                `https://minhhungcar.xyz/customer/customer_payments?customer_contract_id=${contractIDNumber}&offset=0&limit=100`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPayments(response.data.data);
            setCollateralType(response.data.data[0].customer_contract.collateral_type);
            setReturnCollateral(response.data.data[0].customer_contract.is_return_collateral_asset);
        } catch (error: any) {
            console.log('Error get contract payment: ', error.response?.data?.message);
        } finally {
            setContractPaymentLoading(false);
        }
    };

    // give feedback
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
            Alert.alert('', 'Đánh giá của bạn đã được gửi', [
                {
                    text: 'OK',
                    onPress: () => onRefresh(),
                },
            ]);
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





    useEffect(() => {
        // Calculate the total amount of selected payments
        const total = payments
            .filter(pay => selectedPaymentIds.includes(pay.id))
            .reduce((sum, pay) => sum + pay.amount, 0);
        setTotalAmount(total);
    }, [selectedPaymentIds, payments]);

    const toggleCheckbox = (id: number) => {
        setSelectedPaymentIds(prevIds => {
            if (prevIds.includes(id)) {
                return prevIds.filter(paymentId => paymentId !== id);
            } else {
                return [...prevIds, id];
            }
        });
    };


    const handlePayment = async () => {
        try {
            const response = await axios.post('https://minhhungcar.xyz/customer/customer_payment/multiple/generate_qr', {
                customer_payment_ids: selectedPaymentIds,
                return_url: 'https://minh-hung-car-payment-result-fe.vercel.app/'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            router.push({ pathname: '/paymentMethod', params: { payment_url: response.data.data.payment_url, contractID: contractIDNumber } });
            console.log('Payment successful:', response.data.message);
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                console.error('Error processing payment:', error.response.data.message);
            } else {
                console.error('Unexpected error processing payment:', error.message);
            }
        }
    };


    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            getDetailTrip(),
            getContractPayment(),
            getCollateral(),
        ]);
        setRefreshing(false);
    }, []);


    const renderProgressLine = () => {
        return (
            <>
                {(tripStatus === 'canceled' || detailTrip?.status === 'canceled') ?
                    <View style={styles.progressLine}>
                        <View style={styles.stepContainer}>
                            <View style={[styles.progressStep, detailTrip?.status === 'ordered' && styles.progressStepActive]} />
                            <Text style={styles.progressStepText}>Đã đặt</Text>
                        </View>
                        <View style={[styles.progressConnector, detailTrip?.status === 'canceled' && styles.progressConnectorActive]} />
                        <View style={styles.stepContainer}>
                            <View style={[styles.progressStep, detailTrip?.status === 'canceled' && styles.progressStepCancel]} />
                            <Text style={styles.progressStepText}>Đã hủy</Text>
                        </View>
                    </View>
                    :
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
                }
            </>

        );
    };



    return (
        <GestureHandlerRootView>
            {(isLoading || isDetailTripLoading || isContractPaymentLoading || isCollateralLoading) ? (
                <View style={styles.loadingContainer}>
                    <LoadingOverlay message="" />
                </View>
            ) : (
                <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
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
                                        <View style={{ marginBottom: 10, marginTop: 5 }}>
                                            <Text style={{ color: '#686D76' }}>Loại thế chấp: </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                                <View style={styles.radioButtonOuter}>
                                                    <View style={styles.radioButtonInner} />
                                                </View>
                                                <Text style={{ fontWeight: '600' }}>{collateralConvert[collateralType]}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.cardRow}>
                                            <View style={getStatusStyles(detailTrip?.status || '')}>
                                                <Text style={{ color: getStatusStyles(detailTrip?.status || '').color, fontWeight: 'bold' }}>
                                                    {statusConvert[detailTrip?.status || '']}
                                                </Text>
                                            </View>
                                        </View>

                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginHorizontal: 25, marginBottom: 20 }}>
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
                                        style={[
                                            styles.button_2,
                                            { borderColor: detailTrip?.feedback_status === 'inactive' ? 'red' : '#773BFF' }
                                        ]}
                                    >
                                        {detailTrip?.feedback_status === 'inactive' ? (
                                            <Text style={{ color: 'red' }}>Đánh giá bị khóa</Text>
                                        ) : (
                                            !detailTrip?.feedback_rating && !detailTrip?.feedback_content ? (
                                                <Text style={{ color: '#773BFF' }}>Đánh giá</Text>
                                            ) : (
                                                <Text style={{ color: '#773BFF' }}>Xem đánh giá</Text>
                                            )
                                        )}
                                    </TouchableOpacity>
                                )}

                            </View>

                            {/* Payment */}




                            {/* Payments for non-customers */}
                            {payments.filter(pay => pay.payer === 'admin' || collateralType === 'motorbike').length > 0 && (
                                <>
                                    <Divider style={{ marginTop: 22, marginBottom: 8 }} />
                                    <Text style={styles.sectionTitle}>Hoàn trả từ MinhHungCar:</Text>
                                    {/* {payments
                                        .filter(pay => pay.payer === 'admin' || collateralType === 'motorbike')
                                        .map((pay, index) => ( */}
                                    <View style={{ marginHorizontal: 25, marginVertical: 12 }}>
                                        <View style={styles.paymentItem}>
                                            <CheckBox
                                                checked={returnCollateral === true}
                                                // onPress={() => toggleCheckbox(pay.id)}
                                                checkedColor={'#15891A'}
                                                containerStyle={styles.checkBoxContainer}
                                                disabled={true}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 14, textAlign: 'left', fontWeight: '700' }}>
                                                    {collateralConvert[collateralType]}
                                                </Text>

                                            </View>
                                            {(collateralValue && collateralValue.collateral_cash_amount !== 0 && collateralType === 'cash') ?
                                                <View>
                                                    <Text style={{ fontSize: 14, textAlign: 'right', fontWeight: '700' }}>
                                                        {collateralValue.collateral_cash_amount.toLocaleString()} đ
                                                    </Text>
                                                </View>
                                                : ''}
                                        </View>
                                    </View>
                                    {payments
                                        .filter(pay => pay.payer === 'admin' && pay.payment_type === 'refund_pre_pay') // Add the payment_type filter
                                        .sort((a, b) => a.id - b.id)
                                        .map((pay, index) => (
                                            <View key={index} style={{ marginHorizontal: 25, marginVertical: 12 }}>
                                                <View style={styles.paymentItem}>
                                                    <CheckBox
                                                        checked={pay.status === 'paid' || selectedPaymentIds.includes(pay.id)}
                                                        // onPress={() => toggleCheckbox(pay.id)}
                                                        checkedColor={'#15891A'}
                                                        containerStyle={styles.checkBoxContainer}
                                                        disabled={pay.status === 'paid'}
                                                    />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontSize: 14, textAlign: 'left', fontWeight: '700' }}>
                                                            {paymentTypeConvert[pay.payment_type]}
                                                        </Text>
                                                    </View>
                                                    <View>
                                                        <Text style={{ fontSize: 14, textAlign: 'right', fontWeight: '700' }}>
                                                            {pay.amount.toLocaleString()} đ
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}

                                </>
                            )}


                            <Divider style={{ marginTop: 10, marginBottom: 8 }} />
                            <>

                                <View style={{ flex: 1 }}>

                                    {/* Payments for customers */}
                                    {payments.filter((pay) => pay.payer === 'customer').length > 0 && (
                                        <>
                                            <Text style={styles.sectionTitle}>Phải thanh toán:</Text>

                                            {payments
                                                .filter((pay) => pay.payer === 'customer')
                                                .sort((a, b) => a.id - b.id)
                                                .map((pay) => (
                                                    <View key={pay.id} style={{ marginHorizontal: 25, marginVertical: 12 }}>
                                                        <View style={styles.paymentItem}>
                                                            <CheckBox
                                                                checked={pay.status === 'paid' || selectedPaymentIds.includes(pay.id)}
                                                                onPress={() => toggleCheckbox(pay.id)}
                                                                checkedColor={pay.status === 'paid' ? '#15891A' : '#E88D67'}
                                                                containerStyle={styles.checkBoxContainer}
                                                                disabled={pay.status === 'paid'}
                                                            />
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={{ fontSize: 14, textAlign: 'left', fontWeight: '700' }}>
                                                                    {paymentTypeConvert[pay.payment_type]}
                                                                </Text>
                                                            </View>
                                                            <View>
                                                                <Text style={{ fontSize: 14, textAlign: 'right', fontWeight: '700' }}>
                                                                    {pay.amount.toLocaleString()} đ
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        {pay.note ? (
                                                            <View style={{ marginTop: 2, marginLeft: 55 }}>
                                                                <Text style={{ fontSize: 13, color: '#A9A9A9', fontWeight: '600' }}>Ghi chú: {pay.note}</Text>
                                                            </View>
                                                        ) : null}
                                                    </View>
                                                ))}

                                            {/* Payment handling button */}
                                            {selectedPaymentIds.length > 0 && payments.some((pay) => selectedPaymentIds.includes(pay.id) && pay.status !== 'paid') && (
                                                <View>
                                                    <View style={{ marginHorizontal: 25, marginTop: 18, marginBottom: 5 }}>
                                                        <Text style={{ fontSize: 15, fontWeight: '700', textAlign: 'right', color: '#E88D67' }}>
                                                            Tổng tiền cần thanh toán: {totalAmount.toLocaleString()} đ
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity onPress={handlePayment} style={styles.payButton}>
                                                        <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Thanh toán</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </>
                                    )}

                                </View>

                            </>
                        </View>

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
                                                    disabled={!!detailTrip?.feedback_rating}
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
                                            editable={!detailTrip?.feedback_content}
                                        />
                                        {(!detailTrip?.feedback_rating && !detailTrip?.feedback_content) ?
                                            <TouchableOpacity onPress={giveFeedback} style={styles.submitButton}>

                                                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>

                                            </TouchableOpacity>
                                            :
                                            ''
                                        }
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
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginTop: 5
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
        alignItems: 'center',
        marginBottom: 5,
    },

    statusContainer: {
        borderWidth: 1,
        padding: 6,
        borderRadius: 10,
        alignItems: 'center',
    },
    progressLine: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginHorizontal: 40,
        marginTop: 6,
        marginBottom: 35,
        height: 40,
    },
    stepContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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
    progressStepCancel: {
        backgroundColor: 'red',
    },
    progressConnector: {
        flex: 1,
        height: 2,
        marginTop: -18,
        backgroundColor: '#CCCCCC',
    },
    progressConnectorActive: {
        backgroundColor: 'black',
    },
    progressStepText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 6,
    },
    payButton: {
        backgroundColor: '#15891A',
        padding: 12,
        borderRadius: 12,
        // right: 5,
        marginHorizontal: 25,
        marginTop: 20,
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
    checkBoxContainer: {
        marginRight: 20,
        padding: 0,
        color: '#15891A'
    },
    selectAllButton: {
        paddingHorizontal: 25,
        paddingVertical: 10,
        alignItems: 'flex-start',
        marginBottom: 10,
        marginTop: 10,
    },
    selectAllText: {
        fontSize: 14,
        color: '#A9A9A9',
    },
    divider: {
        borderBottomWidth: 1,
        borderColor: '#CED0CE',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
        marginLeft: 20,
        color: '#A9A9A9'
    },
    radioButtonOuter: {
        height: 18,
        width: 18,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioButtonInner: {
        height: 10,
        width: 10,
        borderRadius: 6,
        backgroundColor: 'black',
    },
});
