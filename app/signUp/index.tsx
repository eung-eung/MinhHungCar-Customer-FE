import AuthContent from '@/components/Auth/AuthContent';
import LoadingOverlay from '@/components/LoadingOverlay';
import { sendOtpToUser } from '@/util/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface SignUpCredentials {
    email?: string;
    password: string;
    last_name?: string;
    first_name?: string;
    phone_number: string;
}

const SignUpScreen: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation<NavigationProp<any>>(); // Replace `any` with your navigation stack type if available

    const router = useRouter();

    const signUpHandler = async (credentials: SignUpCredentials): Promise<void> => {
        setIsLoading(true);

        try {
            const { email, password, last_name, first_name, phone_number } = credentials;
            const status = await sendOtpToUser(email, password, last_name, first_name, phone_number);

            if (status === 200) {

                router.push({
                    pathname: "/OTP", params: {
                        email,
                        password,
                        last_name,
                        first_name,
                        phone_number
                    }
                })
            }
        } catch (error) {
            // Error handling is already done in sendOtpToUser function
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            {isLoading && <LoadingOverlay message='' />}
            <ScrollView>
                <View style={styles.container}>
                    <KeyboardAwareScrollView>
                        <View style={styles.header}>
                            <Text style={styles.title}>Bắt đầu nào!</Text>
                            <Text style={styles.subtitle}>
                                Điền đầy đủ thông tin để tạo mới một tài khoản
                            </Text>
                        </View>
                        <AuthContent isLogin={false} onAuthenticate={signUpHandler} />
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
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginTop: 18,
        marginBottom: 36
    },
    formFooter: {
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
        textAlign: 'center',
        marginBottom: 70,
    },
});

export default SignUpScreen;
