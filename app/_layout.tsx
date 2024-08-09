import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router'; // Updated import
import * as SplashScreen from 'expo-splash-screen';
import { useContext, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import AuthConTextProvider, { AuthConText } from '@/store/AuthContext';
import ProtectedProvider from '@/components/Auth/ProtectedProvider';
import BackButton from '@/components/BackButton';
import NotificationHandler from '@/store/NotificationContext';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Alert } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter(); // Use useRouter hook instead of useNavigation

  const handlePress = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn rời khỏi trang này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',

        },
        {
          text: 'Ok',
          onPress: () => router.back(),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <AuthConTextProvider>
      <NotificationHandler>
        <ProtectedProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="signIn/index" options={{ headerShown: false }} />
            <Stack.Screen name="signUp/index" options={{ headerShown: false }} />
            <Stack.Screen name="OTP/index" options={{ headerShown: false }} />
            <Stack.Screen name="profile/index"
              options={{
                headerBackTitleVisible: false,
                title: 'Tài khoản của tôi',
              }} />
            <Stack.Screen name="payInfo/index"
              options={{
                headerBackTitleVisible: false,
                title: 'Thông tin thanh toán',
              }} />
            <Stack.Screen name="uploadQR/index"
              options={{
                headerBackTitleVisible: false,
                title: 'Cập nhật mã QR',
              }} />
            <Stack.Screen name="contract/index"
              options={{
                headerBackTitleVisible: false,
                title: 'Hợp đồng',
                gestureEnabled: false,
                headerLeft: () => (
                  <TabBarIcon
                    name="chevron-left"
                    size={32}
                    color="blue"
                    onPress={handlePress}
                  />
                ),
              }} />
            <Stack.Screen name="detail/index"
              options={{
                headerBackTitleVisible: false,
                title: 'Chi tiết xe',
              }} />
            <Stack.Screen name="success/index"
              options={{
                headerBackTitleVisible: false,
                gestureEnabled: false,
                headerShown: false
              }} />
            <Stack.Screen name="paymentMethod/index"
              options={{
                headerBackTitleVisible: false,
                title: 'Phương thức thanh toán',
                gestureEnabled: false,
                headerLeft: () => (
                  <TabBarIcon
                    name="chevron-left"
                    size={32}
                    color="blue"
                    onPress={handlePress}
                  />
                ),
              }} />
            <Stack.Screen name="list/index"
              options={{
                headerBackTitleVisible: false,
                headerShown: false
              }} />
            <Stack.Screen name="drivingLicense/index"
              options={{
                headerBackTitleVisible: false,
                title: 'Giấy phép lái xe',
              }} />
            <Stack.Screen name="detailTrip/index"
              options={{
                headerBackTitleVisible: false,
                title: 'Chi tiết lịch sử',
                gestureEnabled: false,
                headerLeft: () => (
                  <TabBarIcon
                    name="chevron-left"
                    size={32}
                    color="blue"
                    onPress={() => router.replace('/trip')}
                  />
                ),
              }} />
            <Stack.Screen name="payment/index"
              options={{
                headerBackTitleVisible: false,
                headerShown: false
              }} />
            <Stack.Screen name="checkout/index"
              options={{
                headerBackTitleVisible: false,
                title: 'Xác nhận đặt xe',
              }} />
          </Stack>
        </ProtectedProvider>
      </NotificationHandler>
    </AuthConTextProvider>
  );
}
