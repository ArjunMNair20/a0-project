import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../utils/supabase';
import { theme } from '../utils/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Contact } from '../types'; // Import RootStackParamList and Contact
import { MaterialIcons } from '@expo/vector-icons';

type ContactsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Contacts'>;
};

export default function ContactsScreen({ navigation }: ContactsScreenProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase.from('contacts').select('*');
      if (error) throw error;
      setContacts(data as Contact[]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleContactPress = (contact: Contact) => {
    navigation.navigate('Chat', { contact }); // Pass the contact object correctly
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress(item)}>
      <Text style={styles.contactName}>{item.profiles.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.contact_id.toString()}
        contentContainerStyle={styles.contactList}
      />
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('AddContact')}>
          <MaterialIcons name="person-add" size={24} color="white" />
          <Text style={styles.navButtonText}>Add Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={24} color="white" />
          <Text style={styles.navButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contactList: {
    padding: theme.spacing.md,
  },
  contactItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  contactName: {
    fontSize: 16,
    color: theme.colors.text,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingVertical: theme.spacing.md,
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
});