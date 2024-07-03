import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';

export default function NotificationScreen() {
  const data = [
    {
      id: 3,
      image: 'https://bootdey.com/img/Content/avatar/avatar7.png',
      name: 'March SoulLaComa',
      text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
      attachment: 'https://via.placeholder.com/100x100/FFB6C1/000000',
    },
    {
      id: 2,
      image: 'https://bootdey.com/img/Content/avatar/avatar6.png',
      name: 'John DoeLink',
      text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
      attachment: 'https://via.placeholder.com/100x100/20B2AA/000000',
    },
    {
      id: 4,
      image: 'https://bootdey.com/img/Content/avatar/avatar2.png',
      name: 'Finn DoRemiFaso',
      text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
    },
    {
      id: 5,
      image: 'https://bootdey.com/img/Content/avatar/avatar3.png',
      name: 'Maria More More',
      text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
      attachment: '',
    },
    {
      id: 1,
      image: 'https://bootdey.com/img/Content/avatar/avatar1.png',
      name: 'Frank Odalthh',
      text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
      attachment: 'https://via.placeholder.com/100x100/7B68EE/000000',
    },
    {
      id: 6,
      image: 'https://bootdey.com/img/Content/avatar/avatar4.png',
      name: 'Clark June Boom!',
      text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
      attachment: '',
    },
    {
      id: 7,
      image: 'https://bootdey.com/img/Content/avatar/avatar5.png',
      name: 'The googler',
      text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
      attachment: '',
    },
  ];

  const [comments, setComments] = useState(data);

  return (
    <FlatList
      style={styles.root}
      data={comments}
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
          <TouchableOpacity style={styles.container}>
            <TabBarIcon name='bell-outline' size={40} />
            <View style={styles.content}>
              <View style={mainContentStyle}>
                <View style={styles.text}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text>{item.text}</Text>
                </View>
                <Text style={styles.timeAgo}>2 hours ago</Text>
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
