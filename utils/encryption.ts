import RSA from 'react-native-rsa-native';

export const generateKeyPair = async () => {
  try {
    const keys = await RSA.generate(2048); // Generate 2048-bit RSA key pair
    return {
      publicKey: keys.public,
      privateKey: keys.private
    };
  } catch (error) {
    console.error('Error generating key pair:', error);
    throw error;
  }
};

export const encryptMessage = async (publicKey: string, message: string) => {
  try {
    const encryptedMessage = await RSA.encrypt(message, publicKey);
    return encryptedMessage;
  } catch (error) {
    console.error('Error encrypting message:', error);
    throw error;
  }
};

export const decryptMessage = async (privateKey: string, encryptedMessage: string) => {
  try {
    const decryptedMessage = await RSA.decrypt(encryptedMessage, privateKey);
    return decryptedMessage;
  } catch (error) {
    console.error('Error decrypting message:', error);
    throw error;
  }
};