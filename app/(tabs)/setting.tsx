import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { AuthConText } from '@/store/AuthContext';
import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';

interface Props {
}

const SettingScreen: React.FC<Props> = () => {
    const authCtx = useContext(AuthConText);

    const router = useRouter()

    const handleLogout = async () => {
        try {
            authCtx.logout();
        } catch (error) {
            console.log('Error clearing AsyncStorage:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tài khoản</Text>
                    <View style={styles.sectionBody}>
                        <TouchableOpacity
                            onPress={() => router.push("/profile")}
                            style={styles.row}
                        >

                            <TabBarIcon name='account-edit' style={styles.icon} />
                            <Text style={styles.rowLabel}>Tài khoản của tôi</Text>

                            <TabBarIcon name='chevron-right' style={styles.arrowIcon} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tuỳ chọn</Text>
                    <View style={styles.sectionBody}>
                        <TouchableOpacity
                            onPress={() => router.push("/chat")}
                            style={styles.row}
                        >

                            <TabBarIcon name='chat-processing-outline' style={styles.icon} />
                            <Text style={styles.rowLabel}>Chat với admin</Text>

                            <TabBarIcon name='chevron-right' style={styles.arrowIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push("/payInfo")}
                            style={styles.row}
                        >
                            <TabBarIcon name='credit-card-check-outline' style={styles.icon} />
                            <Text style={styles.rowLabel}>Thông tin thanh toán</Text>
                            <TabBarIcon name='chevron-right' style={styles.arrowIcon} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={[styles.sectionBody, styles.logoutSection]}>
                        <TouchableOpacity onPress={handleLogout} style={styles.row}>
                            <Text style={styles.logoutLabel}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 40,
    },
    container: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileDetails: {
        alignItems: 'center',
        marginTop: 10,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#414d63',
    },
    profileEmail: {
        fontSize: 14,
        color: '#989898',
    },
    section: {
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a69f9f',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    sectionBody: {
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    icon: {
        width: 28,
        height: 26,
        marginRight: 14,
    },

    rowLabel: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    arrowIcon: {
        width: 28,
        height: 26,
    },
    logoutSection: {
        borderRadius: 10,
    },
    logoutLabel: {
        width: '100%',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#ff3b30',
    },
});

export default SettingScreen;
