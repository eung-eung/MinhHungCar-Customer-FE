import React, { useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AuthConText } from '@/store/AuthContext';
import { apiExpoToken } from '@/api/apiConfig';

// Set the notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export default function NotificationHandler({ children }: { children: React.ReactNode }) {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const router = useRouter();
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(expToken => {
                console.log('Push token:', expToken);
                setExpoPushToken(expToken ?? null);
                if (expToken && authCtx.isAuthenticated) {
                    // Send token to backend
                    axios.post(apiExpoToken.expoPushToken, { expo_push_token: expToken }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    })
                        .then(response => console.log('Token sent to backend:', response.data))
                        .catch(error => console.error('Error sending token to backend:', error));
                }
            })
            .catch(err => console.log('Error registering for notifications:', err));
    }, [authCtx.isAuthenticated]);

    useEffect(() => {
        const responseListener = Notifications.addNotificationResponseReceivedListener(notification => {
            console.log('Notification response received:', notification);
            if (notification.notification.request.content.data) {
                console.log('Navigating to:', notification.notification.request.content.data.screen);
                router.navigate(notification.notification.request.content.data.screen);
            }
        });

        return () => {
            console.log('Removing response listener');
            responseListener.remove();
        };
    }, [router]);

    useEffect(() => {
        const foregroundListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received in foreground:', notification);
        });

        return () => {
            console.log('Removing foreground listener');
            foregroundListener.remove();
        };
    }, []);

    async function registerForPushNotificationsAsync() {
        let expToken;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            try {
                const projectId =
                    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                if (!projectId) {
                    throw new Error('Project ID not found');
                }
                expToken = (
                    await Notifications.getExpoPushTokenAsync({
                        projectId,
                    })
                ).data;
                console.log('Expo push token:', expToken);
            } catch (e) {
                expToken = `${e}`;
            }
        } else {
            alert('Must use physical device for Push Notifications');
        }

        return expToken;
    }

    return <>{children}</>;
}
