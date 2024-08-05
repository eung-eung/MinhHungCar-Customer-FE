import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

function LoadingOverlay({ message }: { message: any }) {
    return (
        <View style={styles.rootContainer}>
            <Text style={styles.message}>{message}</Text>
            <ActivityIndicator size="large" />
        </View>
    );
}

export default LoadingOverlay;

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#F2F2F2',
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 999

    },
    message: {
        fontSize: 16,
        marginBottom: 12,
    },
});