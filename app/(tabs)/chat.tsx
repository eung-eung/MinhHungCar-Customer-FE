import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    FlatList,
    Dimensions,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get('window');

interface Message {
    id: number;
    sent: boolean;
    msg: string;
    image: string;
}

const initialMessages: Message[] = [
    {
        id: 1,
        sent: true,
        msg: 'Xin chào! Tôi có thể giúp gì cho anh/chị?',
        image: 'https://www.bootdey.com/img/Content/avatar/avatar1.png',
    },
    {
        id: 2,
        sent: true,
        msg: 'Bạn có quan tâm đến sản phẩm nào không?',
        image: 'https://www.bootdey.com/img/Content/avatar/avatar1.png',
    },
    {
        id: 3,
        sent: false,
        msg: 'Xin chào! Tôi muốn hỏi thông tin về sản phẩm này.',
        image: 'https://www.bootdey.com/img/Content/avatar/avatar6.png',
    },
    {
        id: 4,
        sent: true,
        msg: 'Sản phẩm này có sẵn và đảm bảo chất lượng.',
        image: 'https://www.bootdey.com/img/Content/avatar/avatar1.png',
    },
    {
        id: 5,
        sent: false,
        msg: 'Tôi muốn biết thêm về chi tiết kỹ thuật của sản phẩm.',
        image: 'https://www.bootdey.com/img/Content/avatar/avatar6.png',
    },
    {
        id: 6,
        sent: true,
        msg: 'Sản phẩm này có thể đáp ứng các nhu cầu của bạn.',
        image: 'https://www.bootdey.com/img/Content/avatar/avatar1.png',
    },
    {
        id: 7,
        sent: false,
        msg: 'Tôi cần thêm thông tin về chính sách bảo hành.',
        image: 'https://www.bootdey.com/img/Content/avatar/avatar6.png',
    },
    {
        id: 8,
        sent: false,
        msg: 'Sản phẩm này có giao hàng miễn phí không?',
        image: 'https://www.bootdey.com/img/Content/avatar/avatar6.png',
    },
];

const ChatScreen: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState<string>('');

    const reply = () => {
        const messagesList = [...messages];
        messagesList.push({
            id: Math.floor(Math.random() * 99999999999999999 + 1),
            sent: false,
            msg: newMessage,
            image: 'https://www.bootdey.com/img/Content/avatar/avatar6.png',
        });
        setNewMessage('');
        setMessages(messagesList);
    };

    const send = () => {
        if (newMessage.length > 0) {
            const messagesList = [...messages];
            const newMessageItem = {
                id: Math.floor(Math.random() * 99999999999999999 + 1),
                sent: true, // Set this message as sent by the user
                msg: newMessage,
                image: 'https://www.bootdey.com/img/Content/avatar/avatar1.png',
            };
            messagesList.push(newMessageItem);
            setMessages(messagesList);
            setNewMessage('');
            setTimeout(() => {
                reply();
            }, 2000);
        }
    };

    const renderItem = ({ item }: { item: Message }) => {
        return item.sent ? (
            <View style={styles.sentMsg}>
                <LinearGradient
                    colors={['#447EFF', '#773BFF']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    locations={[0.09, 0.67]}
                    style={styles.sentMsgBlock}
                >
                    <Text style={styles.sentMsgTxt}>{item.msg}</Text>
                </LinearGradient>
            </View>
        ) : (
            <View style={styles.receivedMsg}>
                <Image source={{ uri: item.image }} style={styles.userPic} />
                <View style={styles.receivedMsgBlock}>
                    <Text style={styles.receivedMsgTxt}>{item.msg}</Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                contentContainerStyle={{ paddingBottom: 10 }}
                extraData={messages}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                inverted // Display messages from bottom to top
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#696969"
                    onChangeText={setNewMessage}
                    blurOnSubmit={false}
                    onSubmitEditing={send}
                    placeholder="Type a message"
                    returnKeyType="send"
                    value={newMessage}
                />
                <TouchableOpacity onPress={send} style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Gửi</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f1f1',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#773BFF',
        padding: 10,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    receivedMsg: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        margin: 5,
    },
    receivedMsgBlock: {
        maxWidth: width * 0.7,
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 10,
        marginLeft: 5,
    },
    receivedMsgTxt: {
        fontSize: 15,
        color: '#555',
    },
    sentMsg: {
        alignItems: 'flex-end',
        margin: 5,
    },
    sentMsgBlock: {
        maxWidth: width * 0.7,
        borderRadius: 10,
        backgroundColor: '#6897FF',
        padding: 10,
        marginLeft: 0,
    },
    sentMsgTxt: {
        fontSize: 15,
        color: 'white',
    },
    userPic: {
        height: 30,
        width: 30,
        borderRadius: 20,
        backgroundColor: '#f8f8f8',
    },
});

export default ChatScreen;
