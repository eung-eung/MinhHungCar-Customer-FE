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
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import RNPickerSelect from 'react-native-picker-select';

import * as ImagePicker from 'expo-image-picker';
import { AuthConText } from '@/store/AuthContext';
import { apiPayment } from '@/api/apiConfig';
import LoadingOverlay from '@/components/LoadingOverlay';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useRouter } from 'expo-router';


const PaymentInformationScreen: React.FC = () => {
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;


    const router = useRouter()
    const [bankOwner, setBankOwner] = useState<string>('');
    const [bankNum, setBankNum] = useState<string>('');
    const [banks, setBanks] = useState<string[]>([]);
    const [selectedBank, setSelectedBank] = useState<string>('');

    const [QRUrl, setQRUrl] = useState<string | null>(null);
    const [image, setImage] = useState<{
        selectedImage: string | null;
        avatarURL: string | null;
    }>({
        selectedImage: null,
        avatarURL: null,
    });

    const [isLoading, setLoading] = useState<boolean>(true);
    const [isImageChanged, setIsImageChanged] = useState<boolean>(false);
    const [isInfoChanged, setIsInfoChanged] = useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);

    useEffect(() => {
        getPaymentInfo();
        getBankList();
    }, []);

    const getPaymentInfo = async () => {
        try {
            const response = await axios.get(apiPayment.getPaymentInfo, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.data) {
                setBankOwner(response.data.data.bank_owner || '');
                setBankNum(response.data.data.bank_number || '');
                setSelectedBank(response.data.data.bank_name || '');
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

    const getBankList = async () => {
        try {
            const response = await axios.get(apiPayment.getBankData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.data && response.data.data.banks) {
                setBanks(response.data.data.banks);
                console.log('Fetch success: ', response.data.data.banks);
            } else {
                console.log('No data returned for bank list.');
            }
        } catch (error: any) {
            console.log('Error get bank data: ', error.response.data.message);
        } finally {
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
                avatarURL: imageUri,
            });
            setIsImageChanged(true);
            console.log('Picked image URI: ', imageUri);
            setImageLoading(false);
        }
    };

    const updatePaymentInfo = async () => {
        try {
            const response = await axios.put(
                apiPayment.updatePaymentInfo,
                {
                    bank_number: bankNum,
                    bank_owner: bankOwner,
                    bank_name: selectedBank,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            Alert.alert('Thành công', 'Bạn đã cập nhật thông tin thành công');
            console.log('Update success: ', response.data.message);
        } catch (error: any) {
            if (error.response.data.error_code === 10022) {
                Alert.alert('Thất bại', 'Không thể cập nhật thông tin. Vui lòng thử lại');
            } else {
                console.log('Update failed: ', error.response.data.message);
            }
        }
    };

    // const longestBankName = banks.reduce((max, bank) => (bank.length > max ? bank.length : max), 0);
    // const pickerWidth = longestBankName * 10;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            {isLoading && <LoadingOverlay message="" />}
            <ScrollView>
                <View style={styles.container}>
                    <KeyboardAwareScrollView>
                        <View style={styles.form}>
                            <View style={styles.input}>
                                <Text style={styles.inputLabel}>Chủ tài khoản</Text>
                                <TextInput
                                    clearButtonMode="while-editing"
                                    onChangeText={(name) => {
                                        setBankOwner(name);
                                        setIsInfoChanged(true);
                                    }}
                                    placeholder="abc"
                                    placeholderTextColor="#6b7280"
                                    style={styles.inputControl}
                                    value={bankOwner}
                                />
                            </View>

                            <View style={styles.input}>
                                <Text style={styles.inputLabel}>Số tài khoản</Text>
                                <TextInput
                                    clearButtonMode="while-editing"
                                    onChangeText={(bankNum) => {
                                        setBankNum(bankNum);
                                        setIsInfoChanged(true);
                                    }}
                                    placeholder="00000000000000"
                                    placeholderTextColor="#6b7280"
                                    style={styles.inputControl}
                                    value={bankNum}
                                />
                            </View>

                            <View style={styles.input}>
                                <Text style={styles.inputLabel}>Ngân hàng</Text>
                                <RNPickerSelect
                                    onValueChange={(bank) => {
                                        setSelectedBank(bank);
                                        setIsInfoChanged(true);
                                    }}
                                    value={selectedBank}
                                    placeholder={{
                                        label: 'Chọn ngân hàng',
                                        value: null,
                                        color: '#9EA0A4',
                                    }}
                                    items={banks.map((bank, index) => ({
                                        key: index.toString(),
                                        label: bank,
                                        value: bank,
                                    }))}
                                    style={{
                                        inputIOS: {
                                            ...pickerSelectStyles.inputIOS,
                                            // width: pickerWidth,
                                        },
                                        inputAndroid: {
                                            ...pickerSelectStyles.inputAndroid,
                                            // width: pickerWidth,
                                        },
                                    }}
                                    Icon={() => {
                                        return <TabBarIcon name='chevron-down' size={24} style={{ paddingRight: 7, paddingTop: 8 }} />;
                                    }}
                                />

                            </View>

                            <View style={styles.dividerContainer}>
                                <Divider style={styles.divider} />
                                <Text style={styles.dividerText}>hoặc với mã QR</Text>
                                <Divider style={styles.divider} />
                            </View>

                            <View style={styles.formActionDriving}>
                                <TouchableOpacity onPress={() => router.replace("/uploadQR")}>
                                    <View style={styles.btnDriving}>
                                        <TabBarIcon name='card-account-details-outline' style={{ width: 30, height: 30, marginRight: 12 }} />
                                        <Text style={styles.btnDrivingText}>Upload mã QR</Text>
                                        <TabBarIcon name='chevron-right' size={24} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.formAction}>
                                <TouchableOpacity onPress={updatePaymentInfo}>
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
};

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
export default PaymentInformationScreen;