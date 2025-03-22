import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { supabase } from '../utils/supabase';
import { theme } from '../utils/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AuthScreen from './AuthScreen';
import ChatScreen from './ChatScreen';
import ContactsScreen from './ContactsScreen';
import AddContactScreen from './AddContactScreen';
import SettingsScreen from './SettingsScreen'; // Correct casing
import { RootStackParamList } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Chat: { contact: { contact_id: string; profiles: { email: string; public_key: string } } };
  Contacts: undefined;
  AddContact: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen}/>
      <Stack.Screen name="Chat" component={ChatScreen}/>
      <Stack.Screen name="Contacts" component={ContactsScreen}/>
      <Stack.Screen name="AddContact" component={AddContactScreen}/>
      <Stack.Screen name="Settings" component={SettingsScreen}/>
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <Toaster/>
        <NavigationContainer>
          <RootStack/>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});