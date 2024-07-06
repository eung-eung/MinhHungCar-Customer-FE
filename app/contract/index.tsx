// import React, { useContext, useEffect, useRef, useState } from 'react';
// import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
// import axios from 'axios';
// import { WebView } from 'react-native-webview';
// import { Switch } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { AuthConText } from '@/store/AuthContext';
// import LoadingOverlay from '@/components/LoadingOverlay';

// export default function ContractScreen() {
//     const route = useRouter();
//     const params = useLocalSearchParams()
//     const { contractID } = params;
//     const authCtx = useContext(AuthConText);
//     const token = authCtx.access_token;

//     const [pdfURL, setPdfURL] = useState('');
//     const [contractStatus, setContractStatus] = useState('');
//     const [isLoading, setLoading] = useState(true);
//     const [isChecked, setIsChecked] = useState(false);
//     const webViewRef = useRef<WebView | null>(null);

//     console.log("contractID", contractID)
//     const [refresh, setRefresh] = useState(true)


//     const contractIDNumber = contractID ? Number(contractID) : 0;


//     console.log("contractID", contractID)

//     useEffect(() => {
//         console.log("Received contractID in Contract screen:", contractIDNumber);
//         getDetailContract();
//     }, []);

//     const getDetailContract = async () => {
//         if (contractID && contractIDNumber) {
//             try {
//                 const response = await axios.get(`https://minhhungcar.xyz/customer/contract/${contractIDNumber}`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 });
//                 setPdfURL(response.data.data.url);

//                 setContractStatus(response.data.data.status);
//                 setTimeout(() => {

//                     setLoading(false);

//                 }, 2500);
//             } catch (error: any) {
//                 setLoading(false);
//                 if (error.response.data.error_code === 10051) {
//                     Alert.alert('Lỗi', 'Không thể xem chi tiết hợp đồng lúc này. Vui lòng thử lại sau');
//                     console.log("Error: ", error.response.data.message)
//                 } else if (error.response.data.error_code === 10036) {
//                     Alert.alert('Lỗi', 'Không thể lấy được trạng thái hợp đồng');
//                     console.log("Error: ", error.response.data.message)
//                 } else {
//                     Alert.alert('', 'Có vài lỗi xảy ra. Vui lòng thử lại sau!')
//                     console.log("Error: ", error.response.data.message)
//                 }
//             }
//         } else {
//             setTimeout(() => {

//                 setLoading(false);
//                 Alert.alert('', 'Không có hợp đồng')
//             }, 2500);
//         }

//     };

//     const handleAgreeSwitch = (value: any) => {
//         setIsChecked(value);
//     };

//     const handleSignContract = async () => {
//         try {
//             const response = await axios.put(
//                 `https://minhhungcar.xyz/customer/contract/agree`,
//                 {
//                     customer_contract_id: contractIDNumber,
//                     return_url: 'https://google.com'
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 }
//             );
//             const { payment_url, qr_code_image } = response.data.data;
//             Alert.alert(
//                 'Chúc mừng',
//                 'Bạn đã chấp thuận hợp đồng thành công! Vui lòng thanh toán',
//                 [
//                     {
//                         text: 'OK',
//                         onPress: () =>
//                             route.replace({ pathname: '/paymentMethod', params: { payment_url, qr_code_image } })
//                     }
//                 ]
//             );
//         } catch (error: any) {
//             if (error.response.data.error_code === 10050) {
//                 Alert.alert('Lỗi', 'Không thể chấp thuận hợp đồng lúc này. Vui lòng thử lại sau');
//                 console.log('Sign contract error: ', error.response.data.message);
//             } else {
//                 console.log('Sign contract error: ', error.response.data.message);
//                 Alert.alert('', 'Có vài lỗi xảy ra. Vui lòng thử lại sau!')
//             }
//         }
//     };

//     return (
//         <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
//             {(isLoading && contractStatus !== null) ? (
//                 <View style={styles.loadingContainer}>
//                     <LoadingOverlay message='' />
//                 </View>
//             ) : (
//                 <>
//                     <WebView
//                         ref={webViewRef}
//                         contentMode='desktop'
//                         source={{ uri: `https://docs.google.com/gview?embedded=true&url=${pdfURL}` }}
//                         style={styles.webview}
//                         onLoadEnd={data => {
//                             const { nativeEvent } = data;
//                             const { title } = nativeEvent;
//                             if (!title.trim()) {
//                                 webViewRef.current?.stopLoading();
//                                 webViewRef.current?.reload();
//                             }
//                         }}
//                     />
//                     {contractStatus === 'waiting_for_agreement' && (
//                         <>
//                             <View style={styles.switchContainer}>
//                                 <Text style={styles.switchText}>Tôi đồng ý với các điều khoản trong hợp đồng</Text>
//                                 <Switch
//                                     value={isChecked}
//                                     onValueChange={handleAgreeSwitch}
//                                     trackColor={{ false: '#767577', true: '#773BFF' }}
//                                     thumbColor={isChecked ? 'white' : 'white'}
//                                     ios_backgroundColor="#3e3e3e"
//                                 />
//                             </View>
//                             <TouchableOpacity
//                                 style={[styles.button, !isChecked ? styles.disabledButton : null]}
//                                 onPress={handleSignContract}
//                                 disabled={!isChecked}
//                             >
//                                 <Text style={styles.buttonText}>Chấp thuận hợp đồng</Text>
//                             </TouchableOpacity>
//                         </>
//                     )}
//                 </>
//             )}
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     webview: {
//         flex: 1,
//         width: '100%',
//         height: '100%',
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     switchContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         paddingBottom: 10,
//         marginTop: 10,
//     },
//     switchText: {
//         fontSize: 16,
//         flex: 1,
//     },
//     button: {
//         backgroundColor: '#773BFF',
//         paddingVertical: 15,
//         paddingHorizontal: 30,
//         borderRadius: 25,
//         marginHorizontal: 20,
//         marginTop: 10,
//         alignItems: 'center',
//     },
//     buttonText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     disabledButton: {
//         backgroundColor: '#ccc',
//     },
// });



import React, { useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthConText } from '@/store/AuthContext';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function ContractScreen() {
    const route = useRouter();
    const params = useLocalSearchParams();
    const { contractID } = params;
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    const [pdfURL, setPdfURL] = useState('');
    const [contractStatus, setContractStatus] = useState('');
    const [isLoading, setLoading] = useState(true);
    const [isChecked, setIsChecked] = useState(false);
    const webViewRef = useRef<WebView | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const contractIDNumber = contractID ? Number(contractID) : 0;

    useEffect(() => {
        console.log("Received contractID in Contract screen:", contractIDNumber);
        getDetailContract();
    }, []);

    useEffect(() => {
        if (retryCount < 2 && !pdfURL) {
            console.log(`Retrying load attempt ${retryCount + 1}`);
            const retryTimeout = setTimeout(() => {
                setRetryCount(retryCount + 1);
                getDetailContract();
            }, 500); // Retry after 2.5 seconds

            return () => clearTimeout(retryTimeout);
        } else if (retryCount === 2) {
            setLoading(false);
        }
    }, [pdfURL, retryCount]);

    const getDetailContract = async () => {
        if (contractID && contractIDNumber) {
            try {
                const response = await axios.get(`https://minhhungcar.xyz/customer/contract/${contractIDNumber}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const url = response.data.data?.url;
                if (url) {
                    setPdfURL(url);
                    setContractStatus(response.data.data.status);
                } else {
                    console.log('API response: ', response.data);
                    throw new Error('URL not found in response');
                }
            } catch (error: any) {
                console.log("Error: ", error.response?.data?.message || error.message);
            } finally {
                // Ensure setLoading(false) after each attempt, including retries
                setLoading(false);
            }
        } else {
            setLoading(true); // Show loading until contractID is resolved
            setTimeout(() => setLoading(false), 3000); // Simulate loading for 2.5 seconds
            Alert.alert('', 'Không có hợp đồng');
        }
    };

    const handleAgreeSwitch = (value: any) => {
        setIsChecked(value);
    };

    const handleSignContract = async () => {
        try {
            const response = await axios.put(
                `https://minhhungcar.xyz/customer/contract/agree`,
                {
                    customer_contract_id: contractIDNumber,
                    return_url: 'https://google.com'
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const { payment_url, qr_code_image } = response.data.data;
            Alert.alert(
                'Chúc mừng',
                'Bạn đã chấp thuận hợp đồng thành công! Vui lòng thanh toán',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            route.replace({ pathname: '/paymentMethod', params: { payment_url, qr_code_image } })
                    }
                ]
            );
        } catch (error: any) {
            console.log('Sign contract error: ', error.response?.data?.message || error.message);
            Alert.alert('', 'Có vài lỗi xảy ra. Vui lòng thử lại sau!');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <LoadingOverlay message='' />
                </View>
            ) : (
                <>
                    {pdfURL ? (
                        <WebView
                            ref={webViewRef}
                            contentMode='desktop'
                            source={{ uri: `https://docs.google.com/gview?embedded=true&url=${pdfURL}` }}
                            style={styles.webview}
                            onLoadEnd={data => {
                                const { nativeEvent } = data;
                                const { title } = nativeEvent;
                                if (!title.trim()) {
                                    webViewRef.current?.stopLoading();
                                    webViewRef.current?.reload();
                                }
                            }}
                        />
                    ) : null /* No visible indicator or alert during retry */}

                    {contractStatus === 'waiting_for_agreement' && (
                        <>
                            <View style={styles.switchContainer}>
                                <Text style={styles.switchText}>Tôi đồng ý với các điều khoản trong hợp đồng</Text>
                                <Switch
                                    value={isChecked}
                                    onValueChange={handleAgreeSwitch}
                                    trackColor={{ false: '#767577', true: '#773BFF' }}
                                    thumbColor={isChecked ? 'white' : 'white'}
                                    ios_backgroundColor="#3e3e3e"
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.button, !isChecked ? styles.disabledButton : null]}
                                onPress={handleSignContract}
                                disabled={!isChecked}
                            >
                                <Text style={styles.buttonText}>Chấp thuận hợp đồng</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    webview: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        marginTop: 10,
    },
    switchText: {
        fontSize: 16,
        flex: 1,
    },
    button: {
        backgroundColor: '#773BFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginHorizontal: 20,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});

