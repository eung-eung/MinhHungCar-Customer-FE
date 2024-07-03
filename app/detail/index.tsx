import React, { useContext, useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
    Text,
    Image,
    Alert,
} from 'react-native';
import { Divider } from 'react-native-paper';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthConText } from '@/store/AuthContext';
import LoadingOverlay from '@/components/LoadingOverlay';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

interface CarDetail {
    id: number;
    car_model: {
        brand: string;
        model: string;
        year: string;
        number_of_seats: number;
    };
    images: string[];
    total_trip: number;
    status: string;
    motion: string;
    fuel: string;
    price: number;
    rating: number;
    description: string;
}

interface Comment {
    id: number;
    author: string;
    authorAvatar: string;
    text: string;
    rating: number; // Add rating property
}


const comments: Comment[] = [
    {
        id: 1,
        author: 'Jane Doe',
        authorAvatar: 'https://www.bootdey.com/img/Content/avatar/avatar2.png',
        text: 'Dịch vụ tốt!',
        rating: 5,
    },
    {
        id: 2,
        author: 'John Smith',
        authorAvatar: 'https://www.bootdey.com/img/Content/avatar/avatar3.png',
        text: 'Xe chất lượng ok, giá cả hợp lý, MinhHungCar hỗ trợ khách hàng nhiệt tình',
        rating: 4,
    },
];


export default function DetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    const { carId, startDate, endDate } = params;
    const [carDetail, setCarDetail] = useState<CarDetail>({
        id: 0,
        car_model: {
            brand: '',
            model: '',
            year: '',
            number_of_seats: 0,
        },
        images: [], // Initialize images as an empty string array
        total_trip: 0,
        status: '',
        motion: '',
        fuel: '',
        price: 0,
        rating: 0, // Add the rating property
        description: '', // Add the description property
    });


    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        getCarDetail();
    }, [carId]);

    const getCarDetail = async () => {
        try {
            const response = await axios.get(`https://minhhungcar.xyz/car/${carId}`);
            setCarDetail(response.data.data);
            console.log('Fetch detail successfully: ', response.data.message);
            setLoading(false);
        } catch (error: any) {
            if (error.response.data.error_code === 10027) {
                Alert.alert('Lỗi', 'Không thể xem được chi tiết xe lúc này. Vui lòng thử lại sau!');
            } else {
                Alert.alert('', 'Có vài lỗi xảy ra. Vui lòng thử lại sau!')
                console.log("Error: ", error.response.data.message);
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <LoadingOverlay message='' />
                </View>
            ) : (
                <>
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                        <View style={styles.container}>
                            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                                <View style={styles.photos}>
                                    {Array.isArray(carDetail.images) && carDetail.images.length > 0 ? (
                                        <Swiper
                                            renderPagination={(index, total) => (
                                                <View style={styles.photosPagination}>
                                                    <Text style={styles.photosPaginationText}>
                                                        {index + 1} of {total}
                                                    </Text>
                                                </View>
                                            )}
                                        >
                                            {carDetail.images.map((src, index) => (
                                                <Image
                                                    key={index}
                                                    source={{ uri: src }}
                                                    style={styles.photosImg}
                                                    resizeMode="cover"
                                                />
                                            ))}
                                        </Swiper>
                                    ) : (
                                        <Text style={styles.errorText}>Không có hình ảnh xe</Text>
                                    )}
                                </View>
                                {/*  */}

                                <View style={styles.info}>
                                    <Text style={styles.infoTitle}>{carDetail.car_model.brand + ' ' + carDetail.car_model.model + ' ' + carDetail.car_model.year}</Text>

                                    <View style={styles.infoRating}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                                            <TabBarIcon name='star' color='#F4CE14' size={24} style={{ marginRight: 6 }} />
                                            <Text style={styles.infoRatingLabel}>{carDetail.rating}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                                            <TabBarIcon name='history' color='green' size={24} style={{ marginRight: 6 }} />
                                            <Text style={styles.infoRatingLabel}>{carDetail.total_trip} chuyến</Text>
                                        </View>
                                    </View>


                                    <Text style={styles.infoDescription}>
                                        {carDetail.description}
                                    </Text>
                                </View>

                                <Divider style={{ marginTop: 20 }} />
                                <View style={styles.character}>
                                    <Text style={styles.characterTitle}>Đặc điểm</Text>
                                    <View
                                        style={styles.characterContent}
                                    >

                                        <View style={styles.card}>
                                            <TabBarIcon name='car-shift-pattern' style={styles.cardImg} />
                                            <Text style={styles.cardLabel}>Truyền động</Text>
                                            <Text style={styles.cardContent}>
                                                {carDetail.motion === 'automatic_transmission' ? 'Số tự động' : 'Số sàn'}
                                            </Text>
                                        </View>

                                        <View style={styles.card}>
                                            <TabBarIcon name='seat' style={styles.cardImg} />
                                            <Text style={styles.cardLabel}>Số ghế</Text>
                                            <Text style={styles.cardContent}>{carDetail.car_model?.number_of_seats} chỗ </Text>
                                        </View>

                                        <View style={styles.card}>
                                            <TabBarIcon name='gas-station-outline' style={styles.cardImg} />
                                            <Text style={styles.cardLabel}>Nhiên liệu</Text>
                                            <Text style={styles.cardContent}>
                                                {carDetail.fuel === 'electricity' ? 'Điện' : (carDetail.fuel === 'oil' ? 'Dầu' : 'Xăng')}
                                            </Text>
                                        </View>

                                    </View>
                                </View>

                                <Divider style={{ marginBottom: 5 }} />
                                <View style={styles.require}>
                                    <Text style={styles.requireTitle}>Giấy tờ thuê xe</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, marginLeft: 8 }}>
                                        <TabBarIcon name='card-account-details-outline' size={30} />
                                        <Text style={styles.requireContent}> Xuất trình đầy đủ GPLX, CCCD (chụp hình đối chiếu) hoặc Hộ chiếu (passport) bản gốc giữ lại</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, marginLeft: 8 }}>
                                        {/* <Image style={{ width: 35, height: 35 }} source={require('../assets/money.png')} /> */}
                                        <TabBarIcon name='currency-usd' size={35} />
                                        <Text style={styles.requireContent}>Tài sản thế chấp tiền mặt(15 triệu hoặc theo thỏa thuận) hoặc xe máy có giá trị tương đương 15 triệu trở lên (xe máy và cavet gốc) trước khi nhận xe.</Text>
                                    </View>
                                </View>

                                <Divider style={{ marginTop: 10, marginBottom: 5 }} />
                                <View style={styles.regulation}>
                                    <Text style={styles.regulationTitle}>Điều khoản</Text>
                                    <View style={styles.containerRegulation}>
                                        <View style={styles.bullet}>
                                            <Text>{'\u2022'}</Text>
                                        </View>
                                        <View style={styles.bulletTextContainer}>
                                            <Text style={styles.bulletText}>
                                                Sử dụng xe đúng mục đích.
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.containerRegulation}>
                                        <View style={styles.bullet}>
                                            <Text>{'\u2022'}</Text>
                                        </View>
                                        <View style={styles.bulletTextContainer}>
                                            <Text style={styles.bulletText}>
                                                Không hút thuốc, nhả kẹo cao su, xả rác trong xe.
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.containerRegulation}>
                                        <View style={styles.bullet}>
                                            <Text>{'\u2022'}</Text>
                                        </View>
                                        <View style={styles.bulletTextContainer}>
                                            <Text style={styles.bulletText}>
                                                Không chở hàng quốc cấm, hàng dễ cháy nổ.
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.containerRegulation}>
                                        <View style={styles.bullet}>
                                            <Text>{'\u2022'}</Text>
                                        </View>
                                        <View style={styles.bulletTextContainer}>
                                            <Text style={styles.bulletText}>
                                                Không chở hoa quả, thực phẩm nặng mùi trong xe.
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.containerRegulation}>
                                        <View style={styles.bullet}>
                                            <Text>{'\u2022'}</Text>
                                        </View>
                                        <View style={styles.bulletTextContainer}>
                                            <Text style={styles.bulletText}>
                                                Không sử dụng xe thuê vào mục đích phi pháp, trái  pháp luật...
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <Divider style={{ marginTop: 20, marginBottom: 5 }} />
                                <View style={styles.comment}>
                                    <Text style={styles.commentTitle}>Đánh giá</Text>
                                    <View>
                                        {comments.map((item) => (
                                            <View key={item.id.toString()} style={styles.commentContainer}>
                                                <Image source={{ uri: item.authorAvatar }} style={styles.commentAvatar} />
                                                <View style={styles.commentTextContainer}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                        <Text style={styles.commentAuthor}>{item.author}</Text>
                                                        <Text style={styles.commentDate}>19/05/2024</Text>
                                                    </View>

                                                    <View style={styles.commentRating}>
                                                        <TabBarIcon name='star' size={24} color='#F4CE14' />
                                                        <Text>5</Text>
                                                    </View>
                                                    <Text style={styles.commentText}>{item.text}</Text>
                                                </View>
                                            </View>
                                        ))}
                                        <TouchableOpacity
                                            style={styles.seeMoreContainer}
                                            onPress={() => {

                                            }}>
                                            <Text style={styles.seeMore}>Xem thêm</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </ScrollView>
                        </View>
                    </SafeAreaView>

                    <View style={styles.overlay}>
                        <View style={styles.overlayContent}>
                            <View style={styles.overlayContentTop}>
                                <Text style={styles.overlayContentPrice}>{carDetail.price.toLocaleString('vi-VN')} VNĐ/ngày</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                router.push({ pathname: "/checkout", params: { carId: carDetail.id, startDate: startDate, endDate: endDate } })
                            }}>
                            <View style={styles.btn}>
                                <Text style={styles.btnText}>Chọn thuê</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 0,
        paddingHorizontal: 16,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /** Photos */
    photos: {
        marginTop: 12,
        position: 'relative',
        height: 240,
        overflow: 'hidden',
        borderRadius: 12,
    },
    photosPagination: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#000',
        borderRadius: 12,
    },
    photosPaginationText: {
        fontWeight: '600',
        fontSize: 14,
        color: '#fbfbfb',
    },
    photosImg: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        width: '100%',
        height: 240,
    },
    errorText: {
        textAlign: 'center',
        justifyContent: 'center'
    },

    /** Info */
    info: {
        marginTop: 12,
        backgroundColor: '#f5f5f5',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    infoTitle: {
        fontSize: 20,
        lineHeight: 25,
        letterSpacing: 0.38,
        color: '#000000',
        marginBottom: 6,
        fontWeight: 'bold'
    },
    infoRating: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 15,
        height: 15,
        marginRight: 6
    },
    infoRatingLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#000',
        marginRight: 2,
    },
    infoRatingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8e8e93',
        marginLeft: 2,
    },
    infoDescription: {
        fontWeight: '400',
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: -0.078,
        color: '#8e8e93',
    },
    /** character */
    character: {
        marginTop: 3,
        // backgroundColor: '#f5f5f5',
        paddingVertical: 16,
        paddingHorizontal: 10,
        marginBottom: -15
    },
    characterTitle: {
        fontSize: 20,
        lineHeight: 25,
        fontWeight: '600',
        letterSpacing: 0.38,
        color: '#000000',
        marginBottom: 6,
    },
    characterContent: {
        paddingVertical: 12,
        paddingHorizontal: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    /** Card */
    card: {
        width: 100,
        paddingVertical: 16,
        paddingHorizontal: 0,
        borderRadius: 12,
        flexDirection: 'column',
        alignItems: 'center',
        marginHorizontal: 6,
    },
    cardImg: {
        width: 40,
        height: 40,
        marginBottom: 12,
    },
    cardLabel: {
        fontWeight: '600',
        fontSize: 13,
        lineHeight: 18,
        color: '#838383',
    },
    cardContent: {
        fontWeight: '600',
        fontSize: 15,
        lineHeight: 18,
        color: 'black',
        marginTop: 4
    },
    /** require */
    require: {
        marginTop: 0,
        paddingVertical: 16,
        paddingHorizontal: 10,
        marginBottom: -15

    },
    requireTitle: {
        fontSize: 20,
        lineHeight: 25,
        fontWeight: '600',
        letterSpacing: 0.38,
        color: '#000000',
        marginBottom: 6,
    },
    requireContent: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 18,
        fontSize: 13,
        color: '#6E6D6D'
    },
    /** regulation */
    regulation: {
        marginTop: 0,
        paddingVertical: 16,
        paddingHorizontal: 10,
        marginBottom: -15
    },
    regulationTitle: {
        fontSize: 20,
        lineHeight: 25,
        fontWeight: '600',
        letterSpacing: 0.38,
        color: '#000000',
        marginBottom: 6,
    },
    containerRegulation: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 2,
    },
    bullet: {
        width: 10,
    },
    bulletTextContainer: {
        flex: 1,
        paddingLeft: 5,
    },
    bulletText: {
        lineHeight: 18,
        fontSize: 13,
        color: '#6E6D6D'
    },
    /** comment */
    comment: {
        marginTop: 0,
        paddingVertical: 16,
        paddingHorizontal: 10,
        marginBottom: -15
    },
    commentTitle: {
        fontSize: 20,
        lineHeight: 25,
        fontWeight: '600',
        letterSpacing: 0.38,
        color: '#000000',
        marginBottom: 6,
    },
    commentContainer: {
        flexDirection: 'row',
        padding: 15,
        borderWidth: 1,
        borderColor: '#DCDCDC',
        marginVertical: 8,
        borderRadius: 8,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentTextContainer: {
        flex: 1,
    },
    commentAuthor: {
        fontWeight: 'bold',
        fontSize: 15
    },
    commentDate: {
        color: '#787878',
        marginTop: 2,
        fontSize: 13
    },
    commentRating: {
        marginTop: 5,
        flexDirection: 'row',
    },
    commentText: {
        color: '#333',
        marginTop: 5,
        fontSize: 13
    },
    seeMoreContainer: {
        flexDirection: 'row',
        padding: 12,
        borderWidth: 1.5,
        borderColor: '#828282',
        marginVertical: 8,
        borderRadius: 5,
        justifyContent: 'center'
    },
    seeMore: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 15,
    },
    /** Overlay */
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        paddingHorizontal: 24,
        paddingBottom: 45,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    overlayContent: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        // paddingHorizontal: 10
    },
    overlayContentTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 2,
    },

    overlayContentPrice: {
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '600',
        color: '#5457FB',
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
    },
    btnText: {
        fontSize: 16,
        lineHeight: 26,
        fontWeight: '600',
        color: '#fff',
    },
});

// Example DetailScreen component
// import { useLocalSearchParams } from 'expo-router';
// import React from 'react';
// import { View, Text } from 'react-native';

// const DetailScreen = () => {
//     const params = useLocalSearchParams()
//     const { carId, startDate, endDate } = params;

//     return (
//         <View>
//             <Text>Car ID: {carId}</Text>
//             <Text>Start Date: {startDate}</Text>
//             <Text>End Date: {endDate}</Text>
//             {/* Additional content */}
//         </View>
//     );
// };

// export default DetailScreen;
