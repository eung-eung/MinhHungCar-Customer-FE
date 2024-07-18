import React, { useContext, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthConText } from '@/store/AuthContext';
import { getUser } from '@/util/auth';
import LoadingOverlay from '@/components/LoadingOverlay';
import AuthContent from '@/components/Auth/AuthContent';

interface SignUpCredentials {
    email?: string;
    password: string;
    last_name?: string;
    first_name?: string;
    phone_number: string;
    confirmPassword?: string;
}

export default function SignInScreen() {
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
    const authCtx = useContext(AuthConText);
    console.log('aaaaa: ', authCtx);

    const signInHandler = async ({ phone_number, password }: SignUpCredentials) => {
        if (!phone_number || !password) {
            Alert.alert('Đăng nhập thất bại', 'Vui lòng điền đầy đủ thông tin');
            return;
        }
        setIsAuthenticating(true);
        try {
            const user = await getUser(phone_number, password);
            console.log('user: ', user);

            if (user && user.token) {
                authCtx.authenticate(user.token);
            }
            else {
                throw new Error('Authentication failed. Please check your credentials.');
            }
        } catch (error) {
            console.log('SignIn error:', error);
            // Alert.alert('Authentication failed', 'Please check your credentials and try again.');
            setIsAuthenticating(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {isAuthenticating && <LoadingOverlay message='' />}
            <LinearGradient
                colors={['#5457FB', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0.09, 0.84]}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Đăng nhập</Text>
                </View>
            </LinearGradient>
            <View style={styles.container}>
                <View style={styles.form}>
                    <AuthContent isLogin onAuthenticate={signInHandler} />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        paddingHorizontal: 5,
        paddingVertical: 90,
        backgroundColor: 'white',
    },
    gradient: {
        flex: 1,
    },
    header: {
        paddingTop: 90,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
    },
    form: {
        marginTop: -120,
    },
});
