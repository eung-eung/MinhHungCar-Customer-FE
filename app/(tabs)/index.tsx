import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Card } from '@rneui/themed';
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import CardCar from '@/components/CardCar';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';



export default function HomeScreen() {
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() + 2 * 60 * 60 * 1000)); // Current time + 2 hours
  const [endDate, setEndDate] = useState<Date>(new Date(startDate.getTime() + 24 * 60 * 60 * 1000)); // Start date + 1 day
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);

  const router = useRouter()

  const handleStartDateChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');

    // Check if the selected date is at least 2 hours in the future
    if (currentDate >= new Date(Date.now() + 2 * 60 * 60 * 1000)) {
      setStartDate(currentDate);
      // Automatically set end date to 1 day after start date
      const nextDay = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      setEndDate(nextDay);
      console.log('selectedStartDate: ', formatDateForNavigation(currentDate));
      console.log('selectedEndDate: ', formatDateForNavigation(nextDay));
    } else {
      Alert.alert('', 'Please select a date and time at least 2 hours in the future.');
    }
  };

  const handleEndDateChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    if (currentDate >= new Date(Date.now() + 2 * 60 * 60 * 1000)) {
      setEndDate(currentDate);
      console.log('selectedEndDate: ', formatDateForNavigation(currentDate));
    } else {
      Alert.alert('', 'Please select a date and time at least 2 hours in the future.');
    }
  };

  const formatDateForNavigation = (date: Date) => {
    const isoString = date.toISOString();
    return isoString.slice(0, 19) + 'Z';
  };

  const handleSearch = () => {
    router.push({ pathname: "/list", params: { startDate: formatDateForNavigation(startDate), endDate: formatDateForNavigation(endDate) } })
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
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
              }}
              style={styles.avatarImg}
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>Xin chào, Nguyễn Văn A</Text>
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
                  minimumDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
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
    marginTop: 60,
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
    height: 330,
    padding: 0,
    borderWidth: 1,
  },
  titleBackground: {
    backgroundColor: '#9EA2FE',
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

