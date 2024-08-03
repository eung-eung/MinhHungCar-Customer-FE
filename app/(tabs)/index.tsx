import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Card } from '@rneui/themed';
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';
import { useNavigation, NavigationProp, useIsFocused } from '@react-navigation/native';
import CardCar from '@/components/CardCar';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import axios from 'axios';
import { apiAccount, apiDocument, apiPayment } from '@/api/apiConfig';
import { AuthConText } from '@/store/AuthContext';


const vision = [
  {
    id: 1,
    image: require('../../assets/images/safety.png'),
    title: 'An toàn, linh hoạt và tiện lợi',
    content: 'Nền tảng công nghệ thân thiện với người dùng, cung cấp dịch vụ cho thuê xe tự lái an toàn, linh hoạt và tiện lợi.'
  }, {
    id: 2,
    image: require('../../assets/images/saving-money.png'),
    title: 'Giá cả phải chăng',
    content: 'Dễ dàng tìm và thuê xe phù hợp với nhu cầu với nhiều lựa chọn về loại xe và giá cả.'
  },
  {
    id: 3,
    image: require('../../assets/images/global-shipping.png'),
    title: 'Mạng lưới đối tác trải rộng',
    content: 'Tối ưu hóa hiệu quả sử dụng đội xe và đảm bảo lợi nhuận công bằng cho các chủ xe.'
  }
]

export default function HomeScreen() {
  const authCtx = useContext(AuthConText);
  const token = authCtx.access_token;

  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() + 2 * 60 * 60 * 1000)); // Current time + 2 hours
  const [endDate, setEndDate] = useState<Date>(new Date(startDate.getTime() + 24 * 60 * 60 * 1000)); // Start date + 1 day
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [firstName, setFirstName] = useState()
  const [lastName, setLastName] = useState()
  const [avatarURL, setAvatarURL] = useState()
  const [IdNum, setIdNum] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [bankNum, setBankNum] = useState<string>('');
  const [bankOwner, setBankOwner] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [drivingLicense, setDrivingLicense] = useState([])
  const router = useRouter()




  useEffect(() => {
    if (token) {
      fetchAndValidateUserInfo();
    }
  }, []);




  const handleStartDateChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    const now = new Date();
    const minStartDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Current time + 2 hours

    setShowStartDatePicker(Platform.OS === 'ios');

    if (currentDate >= minStartDate) {
      setStartDate(currentDate);
      // Automatically set end date to 22 hours after start date
      const nextDay = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      setEndDate(nextDay);
      // console.log('selectedStartDate: ', currentDate);
      // console.log('selectedEndDate: ', nextDay);
    } else {
      Alert.alert('', 'Thời gian nhận xe là sau 2 tiếng kể từ hiện tại');
    }
  };

  const handleEndDateChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    const minEndDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Start date + 22 hours

    setShowEndDatePicker(Platform.OS === 'ios');

    if (currentDate >= minEndDate) {
      setEndDate(currentDate);
      console.log('selectedEndDate: ', currentDate);
    } else {
      Alert.alert('', 'Thời gian thuê xe tối thiểu là 1 ngày');
    }
  };




  const handleSearch = () => {
    router.push({ pathname: "/list", params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() } })
  };



  const fetchAndValidateUserInfo = async () => {
    try {
      // Fetch profile information
      const profileResponse = await axios.get(apiAccount.getProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const idNum = profileResponse.data.data.identification_card_number;
      setFirstName(profileResponse.data.data.first_name || '');
      setLastName(profileResponse.data.data.last_name || '');
      setAvatarURL(profileResponse.data.data.avatar_url || null);
      setIdNum(idNum);

      // Fetch payment information
      const paymentResponse = await axios.get(apiPayment.getPaymentInfo, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const qrCodeUrl = paymentResponse.data.data.qr_code_url;
      const bankName = paymentResponse.data.data.bank_name;
      setBankName(bankName);
      setBankNum(paymentResponse.data.data.bank_number);
      setBankOwner(paymentResponse.data.data.bank_owner);
      setPaymentUrl(qrCodeUrl);

      // Fetch driving license information
      const licenseResponse = await axios.get(apiDocument.getDrivingLicenseImage, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const drivingLicense = licenseResponse.data.data;
      setDrivingLicense(drivingLicense);



      // Validate information and prompt user if necessary
      if (profileResponse.data.data.identification_card_number === "" ||
        (!paymentResponse.data.data.qr_code_url && !paymentResponse.data.data.bank_name)
        || licenseResponse.data.data.length === 0
      ) {
        Alert.alert(
          'Yêu cầu cập nhật',
          'Vui lòng cập nhật đầy đủ thông tin tài khoản, giấy phép lái xe và thông tin thanh toán!',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push('/setting');
              },
            },
            {
              text: 'Để sau',
              style: 'cancel',
            },
          ]
        );
      }

    } catch (error: any) {
      if (error.response?.data?.error_code === 10039) {
        Alert.alert('', 'Không thể lấy thông tin tài khoản');
      } else {
        console.log('Error: ', error.response?.data?.message);
      }
    }
  };



  return (
    <ScrollView>
      <View style={styles.container}>
        <Svg height="100%" width="100%" style={styles.background}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#447eff" />
              <Stop offset="100%" stopColor="#773bff" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="180" fill="url(#grad)" />
        </Svg>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {avatarURL ?
              <Image
                source={{
                  uri: avatarURL,
                }}
                style={styles.avatarImg}
              />
              :
              <TabBarIcon name='account-circle' size={35} color="white" style={{ marginRight: 10 }} />
            }
          </View>
          <View>
            <Text style={styles.headerTitle}>Xin chào, {lastName} {firstName}  </Text>
          </View>
        </View>
        <View style={styles.content}>
          <Card containerStyle={styles.card}>
            <View style={styles.titleBackground}>
              <Card.Title style={styles.title}>XE TỰ LÁI</Card.Title>
            </View>
            <View style={styles.dateFromTo}>
              <View style={{ flexDirection: 'row' }}>
                <TabBarIcon name='calendar-clock' color='#6D6D6D' size={24} style={{ marginRight: 5 }} />
                <Text style={styles.fonts_1}>Từ ngày</Text>
              </View>
              <View style={{ marginLeft: -25, marginTop: 5 }}>
                {/* {showStartDatePicker && ( */}
                <DateTimePicker
                  value={startDate}
                  mode="datetime"
                  locale="vi"
                  display="default"
                  onChange={handleStartDateChange as any}
                  minimumDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
                  textColor='black'
                />
                {/* )} */}
              </View>
            </View>
            <View style={styles.dateFromTo}>
              <View style={{ flexDirection: 'row' }}>
                <TabBarIcon name='calendar-clock' color='#6D6D6D' size={24} style={{ marginRight: 5 }} />
                <Text style={styles.fonts_1}>Đến ngày</Text>
              </View>
              <View style={{ marginLeft: -25, marginTop: 5 }}>
                {/* {showEndDatePicker && ( */}
                <DateTimePicker
                  value={endDate}
                  mode="datetime"
                  locale="vi"
                  display="default"

                  onChange={handleEndDateChange as any}
                  minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                />
                {/* )} */}
              </View>
            </View>
            <TouchableOpacity onPress={handleSearch}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Tìm kiếm</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
        <View style={styles.category}>
          <Text style={styles.titleList}>Xe dành cho bạn</Text>
          <View style={styles.listCar}>
            <CardCar />
          </View>
        </View>
        <View style={styles.about}>
          <Text style={styles.titleList_2}>Giới thiệu MinhHungCar</Text>
          <View style={{ backgroundColor: '#F1F5F9', height: 190, marginBottom: 40, marginHorizontal: 25, borderRadius: 20 }}>
            <Text style={{ padding: 25, lineHeight: 20, textAlign: 'justify', color: '#646464' }}>
              MinhHungCar cung cấp dịch vụ cho thuê xe tự lái chất lượng cao, mang đến sự tiện lợi và riêng tư cho khách hàng. Khác với các dịch vụ công cộng, dịch vụ của MinhHungCar cho phép khách hàng tự do di chuyển, dừng chân ăn uống và vui chơi mà không bị giới hạn về thời gian hay lộ trình cố định.
            </Text>
          </View>
        </View>
        <View style={styles.about}>
          <Text style={styles.titleList_2}>Ưu điểm của MinhHungCar</Text>
          <ScrollView horizontal style={styles.scrollView}>
            {vision.map((item) => (
              <View key={item.id} style={styles.box}>
                <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.smallImage} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.titleText}>{item.title}</Text>
                  <Text style={styles.descriptionText}>{item.content}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'left',
    marginTop: 65,
    marginLeft: 40
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  content: {
    position: 'absolute',
    width: '100%',
    top: 110,
    marginHorizontal: 5
  },
  card: {
    marginTop: 10,
    borderRadius: 30,
    width: 355,
    height: 335,
    padding: 0,
    borderWidth: 2,
  },
  titleBackground: {
    backgroundColor: '#7F85FF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 18,
  },
  dateFromTo: {
    marginTop: 22,
    marginHorizontal: 50
  },
  fonts_1: {
    marginBottom: 10,
    marginLeft: 10,
    color: '#6D6D6D',
    fontWeight: 'bold',
  },
  fonts_2: {
    marginBottom: 10,
    marginLeft: 10,
    color: 'black',
    fontWeight: 'bold'
  },
  text: {
    fontSize: 24,
    color: '#fff',
  },
  button: {
    backgroundColor: '#773BFF',
    height: 40,
    width: 295,
    marginTop: 25,
    marginLeft: 30,
    marginRight: 20,
    borderRadius: 30,
  },
  buttonText: {
    textAlign: 'center',
    marginTop: 10,
    color: 'white'
  },
  category: {
    marginTop: 350,
  },
  about: {

  },
  listCar: {
    marginTop: 5,
    flexDirection: 'row',
    height: 360,
    marginLeft: 10
  },
  titleList: {
    marginTop: 30,
    marginLeft: 35,
    fontSize: 24,
    fontWeight: 'bold'
  },
  titleList_2: {
    marginTop: 0,
    marginBottom: 20,
    marginLeft: 35,
    fontSize: 24,
    fontWeight: 'bold'
  },
  avatar: {
    position: 'relative',
  },
  avatarImg: {
    width: 35,
    height: 35,
    borderRadius: 9999,
    marginRight: 10
  },
  avatarNotification: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#fff',
    top: 0,
    right: -2,
    width: 14,
    height: 14,
    backgroundColor: '#d1d5db',
  },
  inputDate: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 15,
    marginRight: 10,
    width: 150
  },
  //vision
  scrollView: {
    marginBottom: 60,
    marginHorizontal: 20
  },
  box: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    height: 190,
    width: 300,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallImage: {
    width: 90,
    height: 90,
  },
  textContainer: {
    flex: 1.5,
    padding: 15,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  descriptionText: {
    lineHeight: 20,
    textAlign: 'justify',
    color: '#646464',
  },
});

