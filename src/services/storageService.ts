import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../utils/imageCompression';

// Helper to convert data URL to Blob
const dataURLToBlob = (dataURL: string) => {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

export const storageService = {
    // Upload a raw file (e.g. PDF, Doc)
    uploadFile: async (file: File, path: string): Promise<string> => {
        try {
            const timestamp = Date.now();
            const uniqueName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `${path}/${uniqueName}`);

            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    },

    // Upload an image with compression
    uploadImage: async (file: File, path: string): Promise<string> => {
        try {
            // Compress first
            const compressedBase64 = await compressImage(file);
            const blob = dataURLToBlob(compressedBase64);

            const timestamp = Date.now();
            const uniqueName = `${timestamp}_${file.name.replace(/\.[^/.]+$/, "")}.jpg`;
            const storageRef = ref(storage, `${path}/${uniqueName}`);

            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    }
};
