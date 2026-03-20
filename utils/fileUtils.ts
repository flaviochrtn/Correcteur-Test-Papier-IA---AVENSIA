import { FileData } from '../types';

export const readFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const processFile = async (file: File): Promise<FileData> => {
  const base64 = await readFileToBase64(file);
  let previewUrl = '';
  
  if (file.type.startsWith('image/')) {
    previewUrl = URL.createObjectURL(file);
  } else if (file.type === 'application/pdf') {
    // For PDF, we might use a generic icon or specific viewer, 
    // but for now a placeholder is fine if we can't easily render PDF first page in browser without libs.
    // We'll just return null previewUrl or handle it in UI.
    previewUrl = ''; 
  }

  return {
    file,
    previewUrl,
    base64,
    mimeType: file.type
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
