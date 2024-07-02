import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import WebView, { } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

interface PaymentScreenProps { }

const PaymentScreen: React.FC<PaymentScreenProps> = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { payment_url } = params;

    const injectedJavascript = `
        (function() {
            window.postMessage = function(data) {
                window.ReactNativeWebView.postMessage(data);
            };
        })()
    `;

    // Ensure payment_url is always treated as a string
    const uri: string = payment_url ? (Array.isArray(payment_url) ? payment_url[0] : payment_url) : '';

    // Define the type for source explicitly
    const source: WebViewSourceUri = { uri };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <WebView
                source={source}
                style={styles.webview}
                startInLoadingState={true}
                injectedJavaScript={injectedJavascript}
                javaScriptEnabled={true}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    webview: {
        flex: 1,
    },
});

export default PaymentScreen;
