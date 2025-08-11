# Cloudinary Setup Guide

This guide will help you set up Cloudinary for file upload and management in your Firebase Activity Forge application.

## Prerequisites

- A Cloudinary account (free tier available)
- Your Firebase project already configured

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Cloudinary Credentials

1. Log in to your Cloudinary dashboard
2. Note your **Cloud Name** from the dashboard (displayed prominently)
3. Go to **Settings** > **Access Keys**
4. Copy your **API Key** and **API Secret**

## Step 3: Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** > **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: Choose a name (e.g., `firebase-app-upload`)
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: Set to `firebase-app` (optional)
5. Click **Save**

## Step 4: Configure Your Application

1. Open `src/lib/cloudinary-config.ts`
2. Replace the placeholder values with your actual credentials:

```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: 'your-actual-cloud-name',
  uploadPreset: 'your-actual-upload-preset',
  apiKey: 'your-actual-api-key',
  apiSecret: 'your-actual-api-secret',
};
```

## Step 5: Environment Variables (Recommended for Production)

For better security, use environment variables instead of hardcoding credentials:

1. Create a `.env` file in your project root:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
```

2. Update `src/lib/cloudinary-config.ts`:

```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'your-api-secret',
};
```

3. Add `.env` to your `.gitignore` file to keep credentials secure.

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the File Upload section in your app
3. Try uploading a file
4. Check that the file appears in your Cloudinary dashboard
5. Test the delete functionality

## Features Available

With the official Cloudinary SDK, you now have access to:

- **File Upload**: Upload files with progress tracking
- **File Deletion**: Delete files from Cloudinary
- **Image Optimization**: Get optimized URLs for images
- **Image Transformations**: Apply various transformations to images
- **Automatic Format Detection**: Cloudinary automatically detects and optimizes file formats

## Usage Examples

### Upload a File
```typescript
import { cloudinaryService } from './lib/cloudinary';

const result = await cloudinaryService.uploadFile(
  file,
  'firebase-app/user-uploads',
  (progress) => console.log(`Upload progress: ${progress}%`)
);
```

### Delete a File
```typescript
await cloudinaryService.deleteFile('public-id-of-file');
```

### Get Optimized Image URL
```typescript
const optimizedUrl = cloudinaryService.getOptimizedUrl('public-id', {
  width: 500,
  height: 300,
  quality: 'auto',
  format: 'webp'
});
```

### Apply Transformations
```typescript
const transformedUrl = cloudinaryService.getTransformedUrl('public-id', {
  crop: 'fill',
  width: 200,
  height: 200,
  gravity: 'face',
  effect: 'blur:1000'
});
```

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check that your upload preset is set to "Unsigned"
2. **Delete Fails**: Verify your API key and secret are correct
3. **CORS Errors**: Ensure your Cloudinary account allows uploads from your domain
4. **File Not Found**: Check that the public ID is correct and the file exists

### Security Notes

- Never expose your API secret in client-side code in production
- Use environment variables for sensitive credentials
- Consider implementing server-side upload endpoints for better security
- Set up proper CORS policies in your Cloudinary account

## Support

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary SDK Documentation](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Support](https://support.cloudinary.com/)
