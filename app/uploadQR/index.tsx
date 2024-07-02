import { Divider } from '@rneui/base';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RNPickerSelect from 'react-native-picker-select';

import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';
import { AuthConText } from '@/store/AuthContext';
import { apiPayment } from '@/api/apiConfig';
import LoadingOverlay from '@/components/LoadingOverlay';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useRouter } from 'expo-router';

interface ImageState {
    selectedImage: string | null;
    avatarURL: string | null;
}

const UploadQR: React.FC = () => {
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ2ZDlhNTk0LTk5Y2MtNGNkMC04NmM3LWI5NDE1NDcwM2U2MCIsInBob25lX251bWJlciI6IjA5ODcyNzE3MTUiLCJyb2xlIjoiY3VzdG9tZXIiLCJpc3N1ZWRfYXQiOiIyMDI0LTA3LTAxVDA5OjA3OjU5LjIzOTUxMzY1MVoiLCJleHBpcmVkX2F0IjoiMjAyNC0wNy0wMlQwOTowNzo1OS4yMzk1MTM3MjFaIn0.qLL8NcAUZj9R9GgEviGn1JWp5de0xdGwYyC8CN8IPks"


    const [QRUrl, setQRUrl] = useState<string | null>(null);
    const [image, setImage] = useState<ImageState>({
        selectedImage: null,
        avatarURL: null,
    });

    const [isLoading, setLoading] = useState(true);
    const [isImageChanged, setIsImageChanged] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
        getPaymentInfo();
    }, []);

    const getPaymentInfo = async () => {
        try {
            const response = await axios.get(apiPayment.getPaymentInfo, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.data.data) {
                setQRUrl(response.data.data.qr_code_url || null);
                console.log('Fetch success: ', response.data);
            } else {
                console.log('No data returned for payment info.');
            }
            setLoading(false);
        } catch (error: any) {
            console.log('Fetch info failed: ', error.response.data.message);
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setImage({
                selectedImage: imageUri,
                avatarURL: imageUri, // Update avatarURL when an image is picked
            });
            setIsImageChanged(true); // Set flag to true when image is changed
            console.log('Picked image URI: ', imageUri);
            setImageLoading(false);
        }
    };

    const uploadQR = async () => {
        const imageFormData = new FormData() as any;
        if (image.selectedImage) {
            imageFormData.append('file', {
                uri: image.selectedImage,
                name: 'QR.jpg',
                type: 'image/jpeg',
            });
        }

        try {
            const response = await axios.post(apiPayment.uploadQR, imageFormData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200 || response.status === 201) {
                setQRUrl(response.data.data.qr_code_url);
                Alert.alert('Thành công', 'Bạn đã cập nhật thông tin thành công');

                console.log('Upload image successfully: ', response.data.message);
            } else {
                console.log('Unexpected response status for image upload:', response.status);
                Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải lên hình ảnh.');
            }
        } catch (error: any) {
            if (error.response?.data?.error_code === 10022) {
                Alert.alert('Thất bại', 'Không thể cập nhật thông tin. Vui lòng thử lại');
            } else {
                Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải lên hình ảnh.');
            }
        }
    };
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            {isLoading && <LoadingOverlay message='' />}
            <ScrollView>
                <View style={styles.container}>
                    <KeyboardAwareScrollView>
                        <View style={styles.form}>

                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <View style={styles.uploadContainer}>
                                    <TouchableOpacity onPress={pickImage} style={styles.QRUploadButton}>
                                        <Text style={{ fontWeight: 'bold' }}>Tải lên</Text>
                                        <TabBarIcon name='upload' style={styles.uploadIcon} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.QR}>
                                    {imageLoading ? (
                                        <ActivityIndicator />
                                    ) : image.selectedImage ? (
                                        <Image key={image.selectedImage} style={styles.qrImage} source={{ uri: image.selectedImage }} />
                                    ) : QRUrl ? (
                                        <Image style={styles.qrImage} source={{ uri: QRUrl }} />
                                    ) : (
                                        <View style={{ width: 268, height: 268, borderWidth: 0.5, borderColor: '#DCDCDC', justifyContent: 'center', alignItems: 'center' }}>
                                            <TabBarIcon name='qrcode' size={250} color='#6C6C6C' />
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={styles.formAction}>
                                <TouchableOpacity onPress={uploadQR}>
                                    <View style={styles.btn}>
                                        <Text style={styles.btnText}>Lưu</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        paddingHorizontal: 0,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },
    form: {
        marginBottom: 24,
        paddingHorizontal: 24,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },
    input: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#222',
        marginBottom: 8,
    },
    inputControl: {
        height: 44,
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
        borderStyle: 'solid',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    divider: {
        width: 100,
    },
    dividerText: {
        marginHorizontal: 10,
        fontWeight: 'bold',
    },
    QR: {
        width: 268,
        height: 268,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 20,
    },
    qrImage: {
        position: 'absolute',
        width: 268,
        height: 268,
    },
    QRUploadButton: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    uploadIcon: {
        width: 24,
        height: 24,
        borderRadius: 5,
    },
    formAction: {
        marginVertical: 24,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        backgroundColor: '#5548E2',
        borderColor: '#5548E2',
    },
    btnText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#fff',
    },
    icon: {
        marginRight: 10,
        marginVertical: 18,
        width: 20,
        height: 10,
    },
    uploadContainer: {
        width: 100,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#999999',
        marginBottom: 5,
        marginTop: 8,
        borderRadius: 10
    },

});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: '#B2B2B2',
        borderRadius: 12,
        width: '100%',
        height: 44,
        marginBottom: 12,
        color: '#222',
        paddingRight: 24
    },
    inputAndroid: {
        fontSize: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#B2B2B2',
        borderRadius: 12,
        width: 335,
        height: 44,
        marginBottom: 12,
        color: '#222',
    },

});
export default UploadQR;