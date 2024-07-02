import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AuthForm from '@/components/Auth/AuthForm';
import { router } from 'expo-router';

interface SignUpCredentials {
    email?: string;
    password: string;
    last_name?: string;
    first_name?: string;
    phone_number: string;
    confirmPassword?: string;
}

interface AuthContentProps {
    isLogin: boolean;
    onAuthenticate: (credentials: SignUpCredentials) => void;
}

const AuthContent: React.FC<AuthContentProps> = ({ isLogin, onAuthenticate }) => {
    const [credentialsInvalid, setCredentialsInvalid] = useState({
        email: false,
        password: false,
        confirmPassword: false,
        last_name: false,
        first_name: false,
        phone_number: false,
    });

    const switchAuthModeHandler = () => {
        if (isLogin) {
            router.replace('/signUp');
        } else {
            router.replace('/signIn');
        }
    };

    const submitHandler = (credentials: SignUpCredentials) => {
        let { password, confirmPassword, phone_number, first_name, last_name } = credentials;

        password = password.trim();
        first_name = first_name?.trim() || '';
        last_name = last_name?.trim() || '';
        confirmPassword = confirmPassword?.trim() || '';
        phone_number = phone_number?.trim() || '';

        const emailIsValid = credentials.email?.includes('@') || isLogin;
        const passwordIsValid = password.length > 1;
        const passwordsAreEqual = password === confirmPassword;
        const firstNameIsValid = first_name.length > 0;
        const lastNameIsValid = last_name.length > 0;
        const phoneNumIsValid = /^[0-9]{10,15}$/.test(phone_number);

        if (
            !emailIsValid ||
            !passwordIsValid ||
            (!isLogin && (!passwordsAreEqual || !firstNameIsValid || !lastNameIsValid || !phoneNumIsValid))
        ) {
            Alert.alert('Dữ liệu không hợp lệ', 'Vui lòng kiểm tra giá trị bạn đã nhập.');
            setCredentialsInvalid({
                email: !emailIsValid,
                password: !passwordIsValid,
                confirmPassword: !passwordIsValid || !passwordsAreEqual,
                first_name: !firstNameIsValid,
                last_name: !lastNameIsValid,
                phone_number: !phoneNumIsValid,
            });
            return;
        }

        if (isLogin) {
            onAuthenticate({ phone_number, password });
        } else {
            onAuthenticate({ email: credentials.email!, password, last_name, first_name, phone_number });
        }
    };

    return (
        <View style={styles.authContent}>
            <AuthForm isLogin={isLogin} onSubmit={submitHandler} credentialsInvalid={credentialsInvalid} />
            <View style={styles.buttons}>
                <TouchableOpacity onPress={switchAuthModeHandler}>
                    {isLogin ? (
                        <Text style={styles.formFooter}>
                            Chưa có tài khoản? <Text style={{ color: '#5548E2' }}>Đăng kí</Text>
                        </Text>
                    ) : (
                        <Text style={styles.formFooter}>
                            Đã có tài khoản? <Text style={{ color: '#5548E2' }}>Đăng nhập</Text>
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    authContent: {
        marginHorizontal: 18,
        padding: 16,
        borderRadius: 8,
        flex: 1,
    },
    buttons: {
        marginTop: 20,
    },
    formFooter: {
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default AuthContent;
