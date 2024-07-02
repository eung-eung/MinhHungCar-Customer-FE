import { AuthConText } from '@/store/AuthContext'
import { useFonts } from 'expo-font';
import { SplashScreen, useRouter } from 'expo-router';
import React, { useContext, useEffect } from 'react'

export default function ProtectedProvider({ children }: { children: React.ReactNode }) {
    const authCtx = useContext(AuthConText)
    const router = useRouter();
    const [loaded] = useFonts({
        SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    });


    useEffect(() => {
        const checkAuthentication = async () => {
            console.log('isAuthenticated: ', authCtx.access_token);

            if (loaded) {
                SplashScreen.hideAsync();
                if (!authCtx.isAuthenticated) {
                    router.replace('/signIn');
                } else {
                    router.replace('/');
                }
            }
        };

        checkAuthentication();
    }, [authCtx, loaded, router]);
    if (!loaded) {
        return null;
    }
    return (
        children
    )
}
