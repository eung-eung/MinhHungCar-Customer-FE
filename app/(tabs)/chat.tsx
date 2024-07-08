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
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthConText } from '@/store/AuthContext';
import axios from 'axios';

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

// interface ChatHistory {
//     id: number;
//     conversation_id: number;
//     sender: number;
//     account: {
//         role_id: number;
//         phone_number: string;
//     };
//     content: string;
//     created_at: string;
// }

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

    const [userMessages, setUserMessages] = useState<ChatHistory[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [conversationId, setConversationId] = useState<number>(-1);
    const [historyMess, setHistoryMess] = useState<ChatHistory[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
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

        if (conversationId !== -1) {
            getHistoryChat();
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
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const handleResponse = (data: any) => {
        switch (data.msg_type) {
            case MessageTypes.TEXTING:
                if (data.sender === 'system') {
                    return;
                }
                if (data.sender === 'admin') {
                    setUserMessages((prev) => [
                        ...prev,
                        { content: data.content, sender: data.sender === "admin" ? 1 : data.sender },
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
            // console.log('Chat history response:', response.data.data); // Log the response data
            setHistoryMess(response.data.data);
        } catch (error: any) {
            console.log(error.response.data.message);
        }
    };

    const renderItemHis: ListRenderItem<ChatHistory> = ({ item }) => {
        console.log('Rendering item:', item); // Log each item being rendered
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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >

            <FlatList
                contentContainerStyle={{ paddingBottom: 10 }}
                extraData={historyMess}
                data={historyMess as ChatHistory[]}
                keyExtractor={(item, index) => `${item.sender}-${index}`}
                renderItem={renderItemHis}
                inverted
            />

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
                    <Text style={styles.sendButtonText}>Gửi</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

// Styles for components
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
        // backgroundColor: '#6897FF',
        padding: 10,
        marginLeft: 0,
    },
    sentMsgTxt: {
        fontSize: 15,
        color: 'white',
    },
});

export default ChatScreen;


