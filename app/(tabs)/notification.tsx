import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { AuthConText } from '@/store/AuthContext';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';

interface Notification {
  id: number;
  title: string;
  content: string;
  url: string;
  created_at: string;
}

export default function NotificationScreen() {
  const authCtx = useContext(AuthConText);
  const token = authCtx.access_token;
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    getNoti()
  }, [])

  const getNoti = async () => {
    try {
      const response = await axios.get(`https://minhhungcar.xyz/customer/notifications?offset=0&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      setNotifications(response.data.data)
      console.log("Fetch notification successfully: ", response.data.message)
    } catch (error: any) {
      console.log("Fetch notification failed: ", error.response.data.message)
    }
  }


  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);

    const formattedDate = date.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(',', '');

    return formattedDate;
  }

  return (
    <FlatList
      style={styles.root}
      data={notifications}
      ItemSeparatorComponent={() => {
        return <View style={styles.separator} />;
      }}
      keyExtractor={(item) => {
        return item.id.toString(); // Ensure the key is returned as a string
      }}
      renderItem={({ item }) => {
        let attachment = <View />;

        let mainContentStyle;

        return (
          <TouchableOpacity style={styles.container} onPress={() => { router.push({ pathname: item.url }) }}>
            <TabBarIcon name='bell-outline' size={40} />
            <View style={styles.content}>
              <View style={mainContentStyle}>
                <View style={styles.text}>
                  <Text style={styles.name}>{item.title}</Text>
                  <Text>{item.content}</Text>
                </View>
                <Text style={styles.timeAgo}>{formatDateTime(item.created_at)}</Text>
              </View>
              {attachment}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 16,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  text: {
    marginBottom: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  content: {
    flex: 1,
    marginLeft: 16,
    marginRight: 0,
  },
  mainContent: {
    marginRight: 60,
  },
  img: {
    height: 50,
    width: 50,
    margin: 0,
  },
  attachment: {
    position: 'absolute',
    right: 0,
    height: 50,
    width: 50,
  },
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  timeAgo: {
    fontSize: 12,
    color: '#696969',
  },
  name: {
    fontSize: 16,
    // color: '#773BFF',
    fontWeight: 'bold',
  },
});

