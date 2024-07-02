import React from 'react';
import { Alert, Button, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TabBarIcon } from './navigation/TabBarIcon';

interface BackButtonProps {
    title?: string;
    subTitle?: string;
    callBack?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ title, subTitle, callBack }) => {
    const router = useRouter();

    return (
        <View>
            <TabBarIcon
                name='arrow-left'
                size={24}
                onPress={() => {
                    Alert.alert(
                        title || '',
                        subTitle || '',
                        [
                            { text: "Ở lại", onPress: () => { } },
                            { text: "Trở về", style: "destructive", onPress: callBack }
                        ]
                    );
                }}
                color="blue"

            />
        </View>
    );
}

export default BackButton;
