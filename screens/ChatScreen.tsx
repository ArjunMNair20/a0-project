import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import { theme } from '../utils/theme';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { toast } from 'sonner-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'; // Import the RootStackParamList

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Store the user data
  const { contact } = route.params;

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        navigation.goBack();
        return;
      }
      setUser(user);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!contact) {
      toast.error('Contact information is missing');
      navigation.goBack();
      return;
    }

    fetchMessages();
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, handleNewMessage)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [contact]);

  const fetchMessages = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast.error('Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (payload: { new: Message }) => {
    const newMsg = payload.new;
    setMessages((current) => [...current, newMsg]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const encryptedContent = encryptMessage(contact.profiles.public_key, newMessage);

      const { error } = await supabase
        .from('messages')
        .insert({
          content: encryptedContent,
          sender_id: user.id,
          receiver_id: contact.contact_id,
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!user) return null; // Ensure user data is available

    const isSender = item.sender_id === user.id;
    return (
      <View style={[styles.messageBubble, isSender ? styles.sentMessage : styles.receivedMessage]}>
        <Text style={[styles.messageText, isSender ? styles.sentMessageText : styles.receivedMessageText]}>
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{contact?.profiles?.email || 'Unknown Contact'}</Text>
        <MaterialIcons name="security" size={24} color={theme.colors.primary} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a secure message..."
          placeholderTextColor={theme.colors.secondary}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <MaterialIcons name="send" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: theme.spacing.md,
  },
  messageList: {
    padding: theme.spacing.md,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: 16,
    marginVertical: theme.spacing.xs,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessageText: {
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,128,0.1)',
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,128,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});