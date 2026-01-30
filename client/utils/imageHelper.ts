import { API_BASE_URL } from '../constants/urls';

export const getImageUrl = (imageData: string | string[] | undefined) => {
    // 1. If no image, return placeholder
    if (!imageData || (Array.isArray(imageData) && imageData.length === 0)) {
        return 'https://via.placeholder.com/150';
    }

    // 2. Get the first image if it's an array
    const imagePath = Array.isArray(imageData) ? imageData[0] : imageData;

    // 3. If it's already a full URL (e.g., from seed data), return it
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // 4. If it's a local path (/uploads/...), append to Server IP
    // API_BASE_URL is "http://.../api", we need to remove the "/api" part
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
};