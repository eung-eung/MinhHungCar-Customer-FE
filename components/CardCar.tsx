import React from 'react';
import {
    StyleSheet,
    Dimensions,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    ListRenderItemInfo,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { TabBarIcon } from './navigation/TabBarIcon';

type Item = {
    img: string;
    name: string;
    price: number;
    stars: number;
    reviews: number;
    saved: boolean;
};

const items: Item[] = [
    {
        img: 'https://images.unsplash.com/photo-1623659248894-1a0272243054?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2405&q=80',
        name: 'Audi R8',
        price: 158600,
        stars: 4.45,
        reviews: 124,
        saved: true,
    },
    {
        img: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80',
        name: 'Porsche 911',
        price: 160100,
        stars: 4.81,
        reviews: 409,
        saved: false,
    },
    {
        img: 'https://images.unsplash.com/photo-1590656364826-5f13b8e32cdc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1065&q=80',
        name: 'Nissan GTR',
        price: 225500,
        stars: 4.3,
        reviews: 72,
        saved: false,
    },
];

const CARD_WIDTH = Math.min(Dimensions.get('screen').width * 0.75, 400);

export default function CardCar() {
    const navigation = useNavigation<NavigationProp<any>>();

    const renderItem = ({ item }: ListRenderItemInfo<Item>) => (
        <TouchableOpacity
            onPress={() => {
                // navigation.navigate('Detail');
            }}>
            <View style={{ paddingHorizontal: 10 }}>
                <View style={styles.card}>
                    <View style={styles.cardTop}>
                        <Image
                            alt=""
                            resizeMode="cover"
                            style={styles.cardImg}
                            source={{ uri: item.img }} />
                    </View>
                    <View style={styles.cardBody}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardPrice}>
                                <Text style={{ fontWeight: '600' }}>{item.price.toLocaleString('en-US')} đ </Text>/
                                ngày
                            </Text>
                        </View>
                        <View style={styles.cardFooter}>
                            <TabBarIcon name='star' size={24} color='#F4CE14' />
                            <Text style={styles.cardStars}>{item.stars}</Text>
                            <Text style={styles.cardReviews}>({item.reviews} reviews)</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 0,
    },
    scrollViewContent: {
        paddingHorizontal: 18,
    },
    /** Card */
    card: {
        position: 'relative',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        width: 320
    },
    cardLikeWrapper: {
        position: 'absolute',
        zIndex: 1,
        top: 12,
        right: 12,
    },
    cardLike: {
        width: 48,
        height: 48,
        borderRadius: 9999,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTop: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    cardImg: {
        width: '100%',
        height: 160,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    cardBody: {
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '500',
        color: '#232425',
    },
    cardPrice: {
        fontSize: 15,
        fontWeight: '400',
        color: '#232425',
    },
    cardFooter: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    cardStars: {
        marginLeft: 2,
        marginRight: 6,
        fontSize: 14,
        fontWeight: '500',
        color: '#232425',
    },
    cardReviews: {
        fontSize: 14,
        fontWeight: '400',
        color: '#595a63',
    },
});
