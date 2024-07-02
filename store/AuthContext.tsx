import { createContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'
export const AuthConText = createContext({
    access_token: '',
    id: '',
    // refresh_token: '',
    isAuthenticated: false,
    authenticate: (token: any) => { },
    logout: () => { }
})

export default function AuthConTextProvider({ children }: { children: any }) {
    const [authToken, setAuthToken] = useState<any>()
    const [id, setId] = useState<any>()


    const authenticate = async (token: any) => {
        console.log('context: ', token);

        setAuthToken(token)
        await AsyncStorage.setItem('token', token)
    }

    const logout = () => {
        AsyncStorage.removeItem('token')
        setAuthToken(null)
        setId(null)
    }
    const value = {
        access_token: authToken,
        authenticate,
        logout,
        id: id,
        isAuthenticated: !!authToken
    }
    return <AuthConText.Provider value={value}>{children}</AuthConText.Provider>
}