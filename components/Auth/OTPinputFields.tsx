import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface OtpInputProps {
    numberOfInputs: number;
    onChangeText: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ numberOfInputs, onChangeText }) => {
    const [pins, setPins] = useState<string[]>(Array(numberOfInputs).fill(''));
    const inputRefs = useRef<TextInput[]>(Array(numberOfInputs).fill(null));

    const handleTextChange = (text: string, index: number) => {
        const newPins = [...pins];
        newPins[index] = text;
        setPins(newPins);

        // Handle automatic field switching
        if (text.length === 1 && index < numberOfInputs - 1) {
            inputRefs.current[index + 1]?.focus(); // Jump to next field
        } else if (text.length === 0 && index > 0) {
            inputRefs.current[index - 1]?.focus(); // Go back to previous field
        }

        onChangeText(newPins.join('')); // Pass the complete OTP
    };

    return (
        <View style={styles.container}>
            {pins.map((pin, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref as TextInput)}
                    value={pin}
                    onChangeText={(text) => handleTextChange(text, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    style={styles.input}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    input: {
        width: 50,
        borderWidth: 1,
        borderColor: Colors.colors.backgroundColorPrimary200,
        padding: 10,
        textAlign: 'center',
        borderRadius: 6,
    },
});

export default OtpInput;
