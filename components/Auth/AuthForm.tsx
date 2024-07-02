import React, { useState } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Input from './Input';

interface AuthFormProps {
    isLogin: boolean;
    onSubmit: (formData: FormData) => void;
    credentialsInvalid: {
        email: boolean;
        password: boolean;
        confirmPassword: boolean;
        first_name: boolean;
        last_name: boolean;
        phone_number: boolean;
    };
}

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    phone_number: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onSubmit, credentialsInvalid }) => {
    const [enteredEmail, setEnteredEmail] = useState<string>('');
    const [enteredPassword, setEnteredPassword] = useState<string>('');
    const [enteredConfirmPassword, setEnteredConfirmPassword] = useState<string>('');
    const [enteredFirstName, setEnteredFirstName] = useState<string>('');
    const [enteredLastName, setEnteredLastName] = useState<string>('');
    const [enteredPhoneNum, setEnteredPhoneNum] = useState<string>('');

    const {
        email: emailIsInvalid,
        password: passwordIsInvalid,
        confirmPassword: passwordsDontMatch,
        first_name: firstNameIsInvalid,
        last_name: lastNameIsInvalid,
        phone_number: phoneIsInvalid
    } = credentialsInvalid;

    const updateInputValueHandler = (inputType: keyof FormData, enteredValue: string) => {
        switch (inputType) {
            case 'email':
                setEnteredEmail(enteredValue);
                break;
            case 'password':
                setEnteredPassword(enteredValue);
                break;
            case 'confirmPassword':
                setEnteredConfirmPassword(enteredValue);
                break;
            case 'first_name':
                setEnteredFirstName(enteredValue);
                break;
            case 'last_name':
                setEnteredLastName(enteredValue);
                break;
            case 'phone_number':
                setEnteredPhoneNum(enteredValue);
                break;
        }
    };

    const submitHandler = () => {
        onSubmit({
            email: enteredEmail,
            password: enteredPassword,
            confirmPassword: enteredConfirmPassword,
            last_name: enteredLastName,
            first_name: enteredFirstName,
            phone_number: enteredPhoneNum
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView>
                <View style={styles.container}>
                    <KeyboardAwareScrollView>

                        <View style={styles.form}>
                            {!isLogin && (
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Họ
                                        <Text style={{ color: 'red' }}>*</Text>
                                    </Text>
                                    <Input
                                        onUpdateValue={updateInputValueHandler.bind(this, 'first_name')}
                                        value={enteredFirstName}
                                        isInvalid={firstNameIsInvalid}
                                        placeholder='Nguyễn'
                                    />
                                </View>
                            )}

                            {!isLogin && (
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Tên  <Text style={{ color: 'red' }}>*</Text></Text>
                                    <Input
                                        onUpdateValue={updateInputValueHandler.bind(this, 'last_name')}
                                        placeholder='Văn A'
                                        value={enteredLastName}
                                        isInvalid={lastNameIsInvalid}
                                    />
                                </View>
                            )}

                            <View style={styles.input}>
                                <Text style={styles.inputLabel}>Số điện thoại  <Text style={{ color: 'red' }}>*</Text></Text>
                                <Input
                                    onUpdateValue={updateInputValueHandler.bind(this, 'phone_number')}
                                    value={enteredPhoneNum}
                                    isInvalid={phoneIsInvalid}
                                    placeholder="0987654321"
                                />
                            </View>

                            {!isLogin && (
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Địa chỉ email<Text style={{ color: 'red' }}>*</Text></Text>
                                    <Input
                                        onUpdateValue={updateInputValueHandler.bind(this, 'email')}
                                        value={enteredEmail}
                                        keyboardType="email-address"
                                        isInvalid={emailIsInvalid}
                                        placeholder="Email"
                                    />
                                </View>
                            )}

                            <View style={styles.input}>
                                <Text style={styles.inputLabel}>Mật khẩu  <Text style={{ color: 'red' }}>*</Text></Text>
                                <Input
                                    onUpdateValue={updateInputValueHandler.bind(this, 'password')}
                                    secure
                                    value={enteredPassword}
                                    isInvalid={passwordIsInvalid}
                                    placeholder="*********"
                                />
                            </View>

                            {!isLogin && (
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Xác nhận mật khẩu  <Text style={{ color: 'red' }}>*</Text></Text>
                                    <Input
                                        onUpdateValue={updateInputValueHandler.bind(this, 'confirmPassword')}
                                        secure
                                        value={enteredConfirmPassword}
                                        isInvalid={passwordsDontMatch}
                                        placeholder="*********"
                                    />
                                </View>
                            )}

                            <View style={styles.formAction}>
                                <TouchableOpacity onPress={submitHandler}>
                                    <View style={styles.btn}>
                                        <Text style={styles.btnText}>{isLogin ? 'Đăng nhập' : 'Đăng kí'}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {isLogin && (
                                <>
                                    <Text style={styles.formActionSpacer}>hoặc tiếp tục với</Text>
                                    <TouchableOpacity onPress={() => { /* handle onPress */ }}>
                                        <View style={styles.btnSecondary}>
                                            <Text style={styles.btnSecondaryText}>Google</Text>
                                            <View style={{ width: 15 }} />
                                        </View>
                                    </TouchableOpacity>
                                </>
                            )}
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
        paddingHorizontal: 45,
        marginTop: 18,
        marginBottom: 36
    },
    form: {
        marginBottom: 24,
        paddingHorizontal: 0,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },
    formAction: {
        marginVertical: 5,
    },
    input: {
        marginBottom: 30,
    },
    inputLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#222',
        marginBottom: 0,
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
    formActionSpacer: {
        marginVertical: 22,
        fontSize: 14,
        fontWeight: '600',
        color: '#4b4858',
        textAlign: 'center',
    },
    btnSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 1,
        backgroundColor: 'transparent',
        borderColor: '#000',
        marginBottom: 45,
    },
    btnSecondaryText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#000',
        justifyContent: 'center',
    },
});

export default AuthForm;
