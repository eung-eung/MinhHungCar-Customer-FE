import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { AuthConText } from '@/store/AuthContext';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator, SectionList } from 'react-native';

interface Notification {
  id: number;
  title: string;
  content: string;
  url: string;
  created_at: string;
}

const PAGE_SIZE = 10; // Number of notifications to fetch per page

export default function NotificationScreen() {
  const authCtx = useContext(AuthConText);
  const token = authCtx.access_token;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    getNotifications();
  }, [page]); // Reload notifications when page changes

  const getNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://minhhungcar.xyz/customer/notifications`, {
        params: {
          offset: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newNotifications = response.data.data || [];
      setNotifications(prevNotifications =>
        page === 1 ? newNotifications : [...prevNotifications, ...newNotifications]
      );
      setHasMore(newNotifications.length === PAGE_SIZE);
      console.log("Fetch notification successfully: ", response.data.message);
    } catch (error: any) {
      console.log("Fetch notification failed: ", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const dayMonthYear = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return dayMonthYear;
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const hour = date.getHours().toString().padStart(2, '0'); // Get hours and pad with leading zero if needed
    const minute = date.getMinutes().toString().padStart(2, '0'); // Get minutes and pad with leading zero if needed
    return `${hour}:${minute}`;
  };


  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groupedNotifications: { title: string, data: Notification[] }[] = [];
    notifications.forEach(notification => {
      const date = formatDateTime(notification.created_at);
      const existingGroup = groupedNotifications.find(group => group.title === date);
      if (existingGroup) {
        existingGroup.data.push(notification);
      } else {
        groupedNotifications.push({ title: date, data: [notification] });
      }
    });
    return groupedNotifications;
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => router.push({ pathname: item.url })}>
      <View style={styles.iconContainer}>
        <TabBarIcon name='bell-outline' size={24} color="#555555" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.notificationText}>{item.content}</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.notificationTime}>{formatTime(item.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  return (
    <SectionList
      style={styles.root}
      sections={groupNotificationsByDate(notifications)}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id.toString()}
      ListFooterComponent={renderFooter}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>Hiện tại chưa có thông báo nào</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    marginRight: 16,
    paddingBottom: 5
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  notificationText: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 300
  },
  emptyMessage: {
    fontSize: 16,
    color: '#B4B4B8',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 16,
    alignItems: 'center',
  },
  sectionHeader: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 120
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#B4B4B3',
    marginTop: 4,
    textAlign: 'right',
  },
  timeContainer: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  emptyChatContainer: {
    flex: 1,
    marginTop: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 16,
    color: '#696969',
  },
});
