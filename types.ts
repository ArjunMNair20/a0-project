export type Contact = {
    contact_id: string;
    profiles: {
      email: string;
      public_key: string;
    };
  };
  
  export type RootStackParamList = {
    Contacts: undefined;
    Chat: { contact: Contact }; // Define the Chat screen with the contact parameter
    AddContact: undefined;
    Settings: undefined;
  };