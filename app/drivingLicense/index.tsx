import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import axios from 'axios';
import { AuthConText } from '@/store/AuthContext';
import { apiAccount, apiDocument } from '@/api/apiConfig';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useRouter } from 'expo-router';

interface FormState {
    images: { field: string; uri: string }[];
    licenseNum: string;
}

export default function DrivingLicenseScreen() {
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;
    const router = useRouter()


    const [form, setForm] = useState<FormState>({
        images: [
            { field: 'licenseFront', uri: '' },
            { field: 'licenseBack', uri: '' },
        ],
        licenseNum: '',
    });

    const [loading, setLoading] = useState(false);


    useEffect(() => {
        getLicenseInfo();
    }, []);

    const pickImageFromLibrary = async (field: string) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const updatedImages = form.images.map((image) => {
                if (image.field === field) {
                    return {
                        ...image,
                        uri: result.assets[0].uri || '', // Ensure uri is not undefined
                    };
                }
                return image;
            });
            setForm({ ...form, images: updatedImages });
        }
    };

    const getLicenseInfo = async () => {
        setLoading(true);
        try {
            const response = await axios.get(apiDocument.getDrivingLicenseImage, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const { data, error_code } = response.data;
            if (error_code === 10000) {
                const images = data || [];
                setForm({
                    images: [
                        { field: 'licenseFront', uri: images[0] || '' },
                        { field: 'licenseBack', uri: images[1] || '' },
                    ],
                    licenseNum: '',
                });
            } else {
                console.log('Error fetching driving license images:', error_code);
                Alert.alert('Lỗi', 'Không có dữ liệu trả về cho thông tin giấy phép lái xe.');
            }
        } catch (error: any) {
            console.log('Fetch info failed: ', error.response?.data?.message);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải thông tin giấy phép lái xe. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        const { images } = form;
        if (images.some((image) => !image.uri)) {
            Alert.alert('Lỗi', 'Vui lòng thêm đủ số lượng hình ảnh');
            return;
        }

        setLoading(true);

        const formData = new FormData() as any;
        images.forEach((image) => {
            if (image.uri) {
                formData.append('files', {
                    uri: image.uri,
                    name: `${image.field}.jpg`,
                    type: 'image/jpeg',
                });
            }
        });

        try {
            const response = await axios.post(apiAccount.uploadDrivingLicense, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('License uploaded:', response.data.message);
            Alert.alert('', 'Cập nhật thông tin giấy phép lái xe thành công!', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error: any) {
            console.log('Error uploading license:', error.response?.data.message);
            Alert.alert('Lỗi', 'Có một vài lỗi xảy ra khi tải lên hình ảnh. Vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <LoadingOverlay message='' />
                </View>
            ) : (
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', marginTop: -30 }}>


                    <ScrollView>
                        <View style={styles.noticeContainer}>
                            <View style={styles.notice}>
                                <Text style={styles.noticeText}>Lưu ý: Để tránh phát sinh vấn đề trong quá trình thuê xe, người đặt xe trên MinhHungCar (đã xác thực GPLX) ĐỒNG THỜI phải là người nhận xe.</Text>
                            </View>
                        </View>
                        <View style={styles.licenseContainer}>

                            <View>
                                <Text style={styles.title}>Ảnh mặt trước GPLX</Text>
                                <Text style={styles.subTitle}>Hình chụp cần thấy được Ảnh đại diện và Số GPLX</Text>
                                <View style={styles.licenseUpload}>
                                    <TouchableOpacity
                                        style={styles.licenseUploadButton}
                                        onPress={() => pickImageFromLibrary('licenseFront')}
                                    >
                                        {form.images.find((image) => image.field === 'licenseFront')?.uri ? (
                                            <Image
                                                style={styles.licensePhoto}
                                                source={{
                                                    uri:
                                                        form.images.find((image) => image.field === 'licenseFront')?.uri ||
                                                        require('@/assets/images/photos.png').uri // Provide a fallback image source if uri is undefined
                                                }}
                                            />
                                        ) : (
                                            <Image style={styles.licensePhotoPlaceholder} source={require('@/assets/images/photos.png')} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>


                        </View>
                        <View style={styles.licenseContainer}>

                            <View>
                                <Text style={styles.title}>Ảnh mặt sau GPLX</Text>
                                <View style={styles.licenseUpload}>
                                    <TouchableOpacity
                                        style={styles.licenseUploadButton}
                                        onPress={() => pickImageFromLibrary('licenseBack')}
                                    >
                                        {form.images.find((image) => image.field === 'licenseBack')?.uri ? (
                                            <Image
                                                style={styles.licensePhoto}
                                                source={{
                                                    uri:
                                                        form.images.find((image) => image.field === 'licenseBack')?.uri ||
                                                        require('@/assets/images/photos.png').uri // Provide a fallback image source if uri is undefined
                                                }}
                                            />
                                        ) : (
                                            <Image style={styles.licensePhotoPlaceholder} source={require('@/assets/images/photos.png')} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>


                        </View>

                        <View style={styles.formAction}>
                            <TouchableOpacity onPress={handleUpload}>
                                <View style={styles.btn}>
                                    <Text style={styles.btnText}>Cập nhật</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                </SafeAreaView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    noticeContainer: {
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notice: {
        width: 341,
        height: 69,
        backgroundColor: '#F2E2E2',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noticeText: {
        color: '#F11B1B',
    },
    licenseContainer: {
        marginHorizontal: 25,
        marginVertical: 20,
        flex: 1,
    },
    licenseUpload: {
        width: '100%',
        height: 180,
        borderColor: '#F1F1F1',
        borderWidth: 0.5,
        marginTop: 15,
        borderRadius: 5,
        backgroundColor: '#F1F1F1',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    licenseUploadButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    licensePhoto: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    licensePhotoPlaceholder: {
        width: 30,
        height: 30,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    subTitle: {
        fontSize: 13,
        color: '#6D6D6D',
        marginTop: 6,
    },
    formAction: {
        marginTop: 5,
        marginBottom: 20,
        marginHorizontal: 25,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        backgroundColor: '#5548E2',
        borderColor: '#5548E2',
    },
    btnDisabled: {
        backgroundColor: '#ccc',
        borderColor: '#ccc',
    },
    btnText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#fff',
    },
});
