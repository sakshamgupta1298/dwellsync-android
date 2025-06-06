import { Platform } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { api } from '../services/api';

export interface ImageUploadResult {
  uri: string;
  type: string;
  name: string;
}

export const pickImage = async (): Promise<ImageUploadResult | null> => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    });

    if (result.didCancel) {
      return null;
    }

    if (result.errorCode) {
      throw new Error(result.errorMessage);
    }

    if (!result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: Platform.OS === 'ios' ? asset.uri?.replace('file://', '') || '' : asset.uri || '',
      type: asset.type || 'image/jpeg',
      name: asset.fileName || 'image.jpg',
    };
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

export const uploadImage = async (image: ImageUploadResult): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      type: image.type,
      name: image.name,
    });

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 