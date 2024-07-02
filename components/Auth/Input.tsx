import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';

interface InputProps {
    label?: string;
    keyboardType?: TextInputProps['keyboardType'];
    secure?: boolean;
    onUpdateValue: (value: string) => void;
    value: string;
    isInvalid: boolean;
    placeholder?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    keyboardType = 'default',
    secure = false,
    onUpdateValue,
    value,
    isInvalid,
    placeholder = ''
}) => {
    return (
        <View style={styles.inputContainer}>
            {label && (
                <Text style={[styles.label, isInvalid && styles.labelInvalid]}>
                    {label}
                </Text>
            )}
            <TextInput
                placeholder={placeholder}
                style={[styles.input, isInvalid && styles.inputInvalid]}
                autoCapitalize='none'
                keyboardType={keyboardType}
                secureTextEntry={secure}
                onChangeText={onUpdateValue}
                value={value}
            />
        </View>
    );
};

export default Input;

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 8,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        color: '#000',
    },
    labelInvalid: {
        color: Colors.colors.error500,
    },
    input: {
        height: 44,
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
    },
    inputInvalid: {
        backgroundColor: Colors.colors.error100,
    },
});
