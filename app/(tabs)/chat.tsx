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
}

interface ChatHistory {
    id: number;
    conversation_id: number;
    sender: number;
    account: {
        role_id: number;
        phone_number: string;
    };
    content: string;
    created_at: string;
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

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [conversationId, setConversationId] = useState<number>(-1);
    const [historyMess, setHistoryMess] = useState<Message[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const textInputRef = useRef<TextInput>(null); // Ref for text input
    const flatListRef = useRef<FlatList<ChatHistory> | null>(null); // Ref for FlatList

    useEffect(() => {
        getHistoryChat();
    }, [conversationId]);

    useEffect(() => {
        // Initialize WebSocket connection on component mount
        if (!socketRef.current) {
            const webSocket = new WebSocket('wss://minhhungcar.xyz/chat');

            webSocket.onopen = () => {
                console.log('WebSocket connection opened');
                // Send join message with access token
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

        // Focus text input when component mounts
        if (textInputRef.current) {
            textInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

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

                // Update UI optimistically
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { id: prevMessages.length + 1, sent: true, msg: newMessage, msg_type: MessageTypes.TEXTING, conversation_id: 82 },
                ]);

                // Clear input field after successful send
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
                console.log(`data ${JSON.stringify(data)}`)
                // Add received message to state
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { id: data.id, sent: false, msg: data.content, msg_type: MessageTypes.TEXTING, conversation_id: data.conversation_id },
                ]);
                break;
            case MessageTypes.SYSTEM_USER_JOIN_RESPONSE:
                // Handle system messages if needed
                setConversationId(data.conversation_id);
                break;
            case MessageTypes.ERROR:
                // Log server error for debugging and notify user
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
            const response = await axios.get(`https://minhhungcar.xyz/customer/conversation/messages?conversation_id=${conversationId}&offset=0&limit=100`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const sortedMessages = response.data.data.sort((a: ChatHistory, b: ChatHistory) => a.id - b.id);
            setHistoryMess(sortedMessages);
        } catch (error: any) {
            console.log(error.response.data.message);
        }
    };

    const renderItem = ({ item }: { item: ChatHistory }) => {
        if (item.account.role_id === 1) {
            return (
                <View style={styles.receivedMsg}>
                    <View style={styles.receivedMsgBlock}>
                        <Text style={styles.receivedMsgTxt}>{item.content}</Text>
                    </View>
                </View>
            );
        } else if (item.account.role_id === 2) {
            return (
                <View style={styles.sentMsg}>
                    <LinearGradient
                        colors={['#447EFF', '#773BFF']}
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
        return null;
    };

    const mappedMessages = messages.map((msg) => ({
        id: msg.id,
        conversation_id: msg.conversation_id!,
        sender: msg.sent ? 2 : 1, // Assuming role_id 2 is sender, 1 is receiver
        account: {
            role_id: msg.sent ? 2 : 1,
            phone_number: '',
        },
        content: msg.msg,
        created_at: '', // You might need to adjust this based on actual data structure
    }));

    const mergedMessages = historyMess.concat(mappedMessages as any);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                ref={flatListRef} // Assign ref to FlatList
                contentContainerStyle={{ paddingBottom: 10 }}
                extraData={messages}
                data={mergedMessages as any}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    ref={textInputRef} // Assign ref to TextInput
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
                    <Text style={styles.sendButtonText}>Send</Text>
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
        backgroundColor: '#6897FF',
        padding: 10,
        marginLeft: 0,
    }, receivedMsgAdmin: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        margin: 5,
        justifyContent: 'flex-start', // Align admin messages to the left
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