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
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { AuthConText } from '@/store/AuthContext';
import { apiAccount } from '@/api/apiConfig';
import LoadingOverlay from '@/components/LoadingOverlay';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';



const ProfileScreen: React.FC = () => {
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [phoneNum, setPhoneNum] = useState<string>('');
    const [IDCard, setIDCard] = useState<string>('');
    const [driveLicense, setDriveLicense] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [day, setDay] = useState<string>('');
    const [month, setMonth] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(true);
    const [avatarURL, setAvatarURL] = useState<string | null>(null);
    const [image, setImage] = useState<{
        selectedImage: string | null;
        avatarURL: string | null;
    }>({
        selectedImage: null,
        avatarURL: null,
    });

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const response = await axios.get(apiAccount.getProfile, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const dobDate = new Date(response.data.data.date_of_birth);
            setDay(dobDate.getDate().toString().padStart(2, '0'));
            setMonth((dobDate.getMonth() + 1).toString().padStart(2, '0'));
            setYear(dobDate.getFullYear().toString());

            setFirstName(response.data.data.first_name || '');
            setLastName(response.data.data.last_name || '');
            setPhoneNum(response.data.data.phone_number || '');
            setIDCard(response.data.data.identification_card_number || '');
            setEmail(response.data.data.email || '');
            setDriveLicense(response.data.data.driving_license || '');
            setAvatarURL(response.data.data.avatar_url || null);

            console.log('Fetch profile successfully ', response.data.data);
            setLoading(false);
        } catch (error: any) {
            if (error.response?.data?.error_code === 10039) {
                Alert.alert('', 'Không thể lấy thông tin tài khoản');
            } else {
                console.log('Error: ', error.response?.data?.message);
            }
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
            console.log('Picked image URI: ', imageUri);
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const submitForm = async () => {
        try {
            // Validate phoneNum
            if (!phoneNum || phoneNum.length !== 10 || !phoneNum.startsWith('0')) {
                Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại có 10 chữ số và bắt đầu bằng số 0.');
                return;
            }

            // Validate IDCard
            if (IDCard.length < 9 || IDCard.length > 11) {
                Alert.alert('Lỗi', 'Số CCCD không hợp lệ. Vui lòng nhập số từ 9 đến 11 chữ số.');
                return;
            }

            // Validate email
            if (!validateEmail(email)) {
                Alert.alert('Lỗi', 'Địa chỉ email không hợp lệ. Vui lòng nhập đúng định dạng email.');
                return;
            }

            // Validate year
            const currentYear = new Date().getFullYear();
            const enteredYear = parseInt(year, 10);
            if (isNaN(enteredYear) || enteredYear < 1900 || enteredYear > currentYear) {
                Alert.alert('Lỗi', 'Năm sinh không hợp lệ');
                return;
            }

            // Combine day, month, and year into a formatted date
            const formattedDob = `${year}-${month}-${day}T00:00:00Z`;

            const formData = {
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNum,
                identification_card_number: IDCard,
                date_of_birth: formattedDob,
                driving_license: driveLicense,
                email: email
            };

            const response = await axios.put(apiAccount.updateProfile, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200 || response.status === 201) {
                console.log('Update successfully: ', response.data.data);
                if (image.selectedImage) {
                    await uploadImage();
                }
                Alert.alert('Thành công', 'Bạn đã cập nhật thông tin thành công!');
                getProfile();
            } else {
                console.log('Unexpected response status:', response.status);
                Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật thông tin.');
            }
        } catch (error) {
            console.log('Error updating profile:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật thông tin.');
        }
    };

    const uploadImage = async () => {
        const imageFormData = new FormData() as any; // Explicitly type as any

        imageFormData.append('file', {
            uri: image.selectedImage!,
            name: 'avatar.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await axios.post(apiAccount.uploadProfileAvatar, imageFormData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 || response.status === 201) {
                setAvatarURL(response.data.data.url);
                console.log('Upload image successfully: ', response.data.data);
            } else {
                console.log('Unexpected response status for image upload:', response.status);
                Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải lên hình ảnh.');
            }
        } catch (error) {
            console.log('Upload image failed!', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải lên hình ảnh.');
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator />
                    </View>
                ) : (
                    <View style={styles.container}>
                        <KeyboardAwareScrollView>
                            <View style={styles.avatarContainer}>
                                {image.selectedImage ? (
                                    <Image key={image.selectedImage} style={styles.avatar} source={{ uri: image.selectedImage }} />
                                ) : avatarURL ? (
                                    <Image style={styles.avatar} source={{ uri: avatarURL }} />
                                ) : (
                                    <Image
                                        style={styles.avatar}
                                        source={{ uri: 'https://static.thenounproject.com/png/642902-200.png' }}
                                    />
                                )}
                                <TouchableOpacity style={styles.editIconButton} onPress={pickImage}>
                                    <TabBarIcon name='pencil' style={styles.editIcon} />

                                </TouchableOpacity>
                            </View>
                            <View style={styles.form}>
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Họ</Text>
                                    <TextInput
                                        clearButtonMode="while-editing"
                                        onChangeText={(firstName) => setFirstName(firstName)}
                                        placeholder="abc"
                                        placeholderTextColor="#6b7280"
                                        style={styles.inputControl}
                                        value={firstName}
                                    />
                                </View>

                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Tên</Text>
                                    <TextInput
                                        clearButtonMode="while-editing"
                                        onChangeText={(lastName) => setLastName(lastName)}
                                        placeholder="abc"
                                        placeholderTextColor="#6b7280"
                                        style={styles.inputControl}
                                        value={lastName}
                                    />
                                </View>
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Số điện thoại</Text>
                                    <TextInput
                                        clearButtonMode="while-editing"
                                        onChangeText={(phone) => setPhoneNum(phone)}
                                        placeholder="0987654321"
                                        placeholderTextColor="#6b7280"
                                        style={styles.inputControl}
                                        keyboardType="numeric"
                                        value={phoneNum}
                                        editable={false}
                                    />
                                </View>
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Địa chỉ email</Text>
                                    <TextInput
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        onChangeText={(email) => setEmail(email)}
                                        clearButtonMode="while-editing"
                                        keyboardType="email-address"
                                        placeholder="abc123@gmail.com"
                                        placeholderTextColor="#B2B2B2"
                                        style={styles.inputControl}
                                        value={email}
                                    />
                                </View>
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Ngày sinh</Text>
                                    <View style={styles.inputRow}>
                                        <TextInput
                                            onChangeText={(text) => {
                                                if (/^\d*$/.test(text) && text.length <= 2) {
                                                    setDay(text);
                                                }
                                            }}
                                            placeholder="dd"
                                            placeholderTextColor="#6b7280"
                                            style={[styles.inputControl, styles.smallInput]}
                                            keyboardType="numeric"
                                            value={day}
                                        />
                                        <TextInput
                                            onChangeText={(text) => {
                                                if (/^\d*$/.test(text) && text.length <= 2) {
                                                    setMonth(text);
                                                }
                                            }}
                                            placeholder="mm"
                                            placeholderTextColor="#6b7280"
                                            style={[styles.inputControl, styles.smallInput]}
                                            keyboardType="numeric"
                                            value={month}
                                        />
                                        <TextInput
                                            onChangeText={(text) => {
                                                if (/^\d*$/.test(text) && text.length <= 4) {
                                                    setYear(text);
                                                }
                                            }}
                                            placeholder="yyyy"
                                            placeholderTextColor="#6b7280"
                                            style={[styles.inputControl, styles.smallInput]}
                                            keyboardType="numeric"
                                            value={year}
                                        />
                                    </View>
                                </View>
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Số CCCD</Text>
                                    <TextInput
                                        clearButtonMode="while-editing"
                                        onChangeText={(id) => setIDCard(id)}
                                        placeholder="000000000000"
                                        placeholderTextColor="#6b7280"
                                        style={styles.inputControl}
                                        value={IDCard}
                                    />
                                </View>

                                <View style={styles.formAction}>
                                    <TouchableOpacity onPress={submitForm}>
                                        <View style={styles.btn}>
                                            <Text style={styles.btnText}>Lưu</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </View>
                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1d1d1d',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#929292',
        textAlign: 'center'
    },
    /** avatar */

    avatarContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 35
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        position: 'relative',
    },
    changeAvatarButtonText: {
        marginTop: 10,
        color: '#773BFF'
    },
    editIconButton: {
        position: 'absolute',
        bottom: -10,
        right: 150,
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#AFAFAF',
        borderRadius: 50,
        backgroundColor: 'white',
    },
    editIcon: {
        width: 27,
        height: 32,
        resizeMode: 'cover',
    },
    /** Form */
    form: {
        marginBottom: 24,
        paddingHorizontal: 24,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },
    formAction: {
        marginVertical: 24,
    },
    formFooter: {
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
        textAlign: 'center',
        marginBottom: 70,
    },
    /** Input */
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
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
        borderStyle: 'solid',
    },
    smallInput: {
        width: '30%',
    },

    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    /** Button */
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
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
    formActionDriving: {
        marginVertical: 10
    },
    btnDriving: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },
    btnDrivingText: {
        fontSize: 14,
        lineHeight: 24,
        fontWeight: '600',
        flex: 1,
    },
});

export default ProfileScreen;
