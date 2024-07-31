import React, { useContext, useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    FlatList,
    Dimensions,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ListRenderItem,
    Image,
    TouchableWithoutFeedback,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthConText } from '@/store/AuthContext';
import axios from 'axios';
import { ActivityIndicator } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Keyboard } from 'react-native';

const { width } = Dimensions.get('window');

interface Message {
    id: number;
    sent: boolean;
    msg: string;
    content?: string;
    msg_type: string;
    conversation_id?: number;
    sender: string;
}

interface ChatHistory {
    sender: number;
    content: string;
}

const MessageTypes = {
    USER_JOIN: "USER_JOIN",
    TEXTING: "TEXTING",
    SYSTEM_USER_JOIN_RESPONSE: "SYSTEM_USER_JOIN_RESPONSE",
    ERROR: "ERROR",
};

const ChatScreen: React.FC = () => {
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    const [messages, setMessages] = useState<ChatHistory[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [conversationId, setConversationId] = useState<number>(-1);
    const socketRef = useRef<WebSocket | null>(null);

    const [isLoading, setLoading] = useState(true)


    useEffect(() => {
        if (conversationId !== -1) {
            getHistoryChat();
        }
        if (!socketRef.current) {
            const webSocket = new WebSocket('wss://minhhungcar.xyz/chat');

            webSocket.onopen = () => {
                console.log('WebSocket connection opened');
                webSocket.send(
                    JSON.stringify({
                        msg_type: MessageTypes.USER_JOIN,
                        access_token: `Bearer ${token}`,
                        conversation_id: conversationId,
                    })
                );
            };

            webSocket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log('Received message:', e.data);
                handleResponse(data);
            };

            webSocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                Alert.alert('Error', 'WebSocket connection error');
            };

            webSocket.onclose = () => {
                console.log('WebSocket connection closed');
            };

            socketRef.current = webSocket;
        }
    }, [conversationId]);

    const sendMessage = async () => {
        try {
            if (socketRef.current && newMessage.trim()) {
                const message = {
                    conversation_id: conversationId,
                    msg_type: MessageTypes.TEXTING,
                    content: newMessage,
                    access_token: `Bearer ${token}`,
                };

                console.log('Sending message:', message);
                socketRef.current.send(JSON.stringify(message));

                // Add the new message to the messages state
                setMessages((prevMessages) => [
                    { content: newMessage, sender: 0 },
                    ...prevMessages,
                ]);

                setNewMessage('');
            } else {
                Alert.alert('Lỗi', 'Không thể gửi tin nhắn trống');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Lỗi', 'Gửi tin nhắn thất bại');
        }
    };

    const handleResponse = (data: any) => {
        switch (data.msg_type) {
            case MessageTypes.TEXTING:
                if (data.sender === 'system') {
                    return;
                }
                if (data.sender === 'admin') {
                    setMessages((prevMessages) => [
                        { content: data.content, sender: 1 },
                        ...prevMessages,
                    ]);
                }
                break;
            case MessageTypes.SYSTEM_USER_JOIN_RESPONSE:
                setConversationId(data.conversation_id);
                break;
            case MessageTypes.ERROR:
                if (data.content.includes('foreign key constraint "messages_conversation_id_fkey"')) {
                    Alert.alert('Error', 'Invalid conversation ID');
                } else {
                    Alert.alert('Error', data.content);
                }
                break;
            default:
                break;
        }
    };

    const getHistoryChat = async () => {
        try {
            const response = await axios.get(
                `https://minhhungcar.xyz/customer/conversation/messages?conversation_id=${conversationId}&offset=0&limit=100`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data.data);
            setLoading(false);
        } catch (error: any) {
            console.log(error.response.data.message);
        }
    };

    const renderItem: ListRenderItem<ChatHistory> = ({ item }) => {
        if (item.sender === 1) {
            return (
                <View style={styles.receivedMsg}>
                    <View style={styles.receivedMsgBlock}>
                        <Text style={styles.receivedMsgTxt}>{item.content}</Text>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.sentMsg}>
                    <LinearGradient
                        colors={['#A5B4FC', '#C084FC']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        locations={[0.09, 0.67]}
                        style={styles.sentMsgBlock}
                    >
                        <Text style={styles.sentMsgTxt}>{item.content}</Text>
                    </LinearGradient>
                </View>
            );
        }
    };

    return (
        <>
            {isLoading ? (
                <View style={styles.loaderStyle}>
                    <ActivityIndicator size="large" color="#aaa" />
                </View>
            ) : (
                <SafeAreaView style={{ flex: 1 }}>
                    {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                    <KeyboardAvoidingView

                        style={styles.container}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    >

                        {messages.length === 0 ? (
                            <View style={styles.emptyChatContainer}>
                                <Image src='https://minhhungcar-admin.vercel.app/minhhunglogo.png' style={{ width: 190, height: 80, objectFit: 'contain', marginBottom: 15 }} />
                                <Text style={styles.emptyChatText}>Hãy bắt đầu cuộc trò chuyện ngay bây giờ!</Text>
                            </View>
                        ) : (
                            <FlatList
                                contentContainerStyle={{ paddingBottom: 10 }}
                                data={messages}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={renderItem}
                                inverted
                            />
                        )}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor="#696969"
                                onChangeText={setNewMessage}
                                blurOnSubmit={false}
                                onSubmitEditing={sendMessage}
                                placeholder="Type a message"
                                returnKeyType="send"
                                value={newMessage}
                            />
                            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                                {/* <Text style={styles.sendButtonText}> */}
                                <TabBarIcon name='send' color='#773BFF' />
                                {/* </Text> */}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                    {/* </TouchableWithoutFeedback> */}
                </SafeAreaView>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    loaderStyle: {
        marginTop: 100,
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderTopColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 4,
    },
    sendButton: {
        backgroundColor: 'white',
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
        backgroundColor: '#F2F2F2',
        padding: 10,
        marginLeft: 10,
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
        // backgroundColor: '#6897FF',
        padding: 10,
        marginLeft: 0,
        marginRight: 10,
        marginBottom: 5
    },
    sentMsgTxt: {
        fontSize: 15,
        color: 'white',
    },
    emptyChatContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyChatText: {
        fontSize: 16,
        color: '#696969',
    },
});

export default ChatScreen;




