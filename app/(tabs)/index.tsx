import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Card } from '@rneui/themed';
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import CardCar from '@/components/CardCar';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import axios from 'axios';
import { apiAccount } from '@/api/apiConfig';
import { AuthConText } from '@/store/AuthContext';




export default function HomeScreen() {
  const authCtx = useContext(AuthConText);
  const token = authCtx.access_token;

  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Current time + 2 hours
  const [endDate, setEndDate] = useState<Date>(new Date(startDate.getTime() + 24 * 60 * 60 * 1000)); // Start date + 1 day
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);

  const [firstName, setFirstName] = useState()
  const [lastName, setLastName] = useState()
  const [avatarURL, setAvatarURL] = useState()

  const router = useRouter()

  useEffect(() => {
    getProfile()
  }, [firstName, lastName, avatarURL])

  const handleStartDateChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');

    // Check if the selected date is at least 2 hours in the future
    if (currentDate >= new Date(Date.now() + 2 * 60 * 60 * 1000)) {
      setStartDate(currentDate);
      // Automatically set end date to 24g after start date
      const nextDay = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      setEndDate(nextDay);
      console.log('selectedStartDate: ', currentDate);
      console.log('selectedEndDate: ', nextDay);
    } else {
      Alert.alert('', 'Thời gian nhận xe tối thiểu là sau 2 tiếng kể từ hiện tại');
    }
  };

  const handleEndDateChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    if (currentDate >= new Date(Date.now() + 24 * 60 * 60 * 1000)) {
      setEndDate(currentDate);
      console.log('selectedEndDate: ', currentDate);
    } else {
      Alert.alert('', 'Thời gian nhận xe tối thiểu là sau 1 ngày kể từ hiện tại');
    }
  };



  const handleSearch = () => {
    router.push({ pathname: "/list", params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() } })
  };


  //get profile
  const getProfile = async () => {
    try {
      const response = await axios.get(apiAccount.getProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFirstName(response.data.data.first_name || '');
      setLastName(response.data.data.last_name || '');
      setAvatarURL(response.data.data.avatar_url || null);


      // console.log('Fetch profile successfully ', response.data.data);
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
            <Text style={styles.headerTitle}>Xin chào, {firstName}{lastName} </Text>
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
                  minimumDate={new Date(Date.now() + 24 * 2 * 60 * 60 * 1000)}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    top: 110,
    left: 5,
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
  listCar: {
    marginTop: 5,
    flexDirection: 'row',
    height: 280
  },
  titleList: {
    marginTop: 30,
    marginLeft: 30,
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
});

