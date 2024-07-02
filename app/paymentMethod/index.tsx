import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

interface PaymentMethodScreenProps { }

const PaymentMethodScreen: React.FC<PaymentMethodScreenProps> = () => {
    const webViewRef = React.useRef<any>(); // Change type as needed

    const router = useRouter();
    const params = useLocalSearchParams();

    const { payment_url, qr_code_image } = params;

    const navigateToPayment = () => {
        router.push({
            pathname: '/payment',
            params: { payment_url },
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ paddingVertical: 24, paddingHorizontal: 30 }}>
                <Text style={{ fontSize: 17, fontWeight: '700' }}>Chọn phương thức thanh toán</Text>
                <TouchableOpacity onPress={navigateToPayment} style={styles.paymentButton}>
                    <Image source={require('@/assets/images/vnpayLogo.png')} style={styles.vnpayLogo} />
                    <TabBarIcon name='chevron-right' size={24} style={{ marginTop: 5 }} />
                    {/* <Image source={require('../assets/right.png')} style={styles.arrowIcon} /> */}
                </TouchableOpacity>
                {/* Uncomment this section if using QR Code */}
                {/* <View style={styles.dividerContainer}>
                    <Divider style={styles.divider} />
                    <Text style={styles.dividerText}>hoặc với mã QR</Text>
                    <Divider style={styles.divider} />
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <View style={styles.QR}>
                        <Image style={styles.qrImage} source={{ uri: qr_code_image }} />
                    </View>
                </View> */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    paymentButton: {
        width: '100%',
        height: 80,
        marginTop: 20,
        flexDirection: 'row',
        paddingBottom: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 0.5,
        borderColor: '#A1A1A1',
    },
    vnpayLogo: {
        width: '80%',
        height: '100%',
        resizeMode: 'cover',
    },
    arrowIcon: {
        width: 24,
        height: 24,
        marginTop: 5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginTop: 30,
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
});

export default PaymentMethodScreen;
