// Cloudinary Configuration
// Replace these values with your actual Cloudinary credentials

export const CLOUDINARY_CONFIG = {
  cloudName: 'dz4uwpgoi', // Your Cloudinary cloud name
  uploadPreset: 'Activity-uploads', // Your upload preset (unsigned)
  apiKey: '158285269785293', // Required for server-side operations like deletion
  apiSecret: 'mhX_u-fp8tgIYgu4S-eEVc_XaDY', // Required for server-side operations like deletion
};

// Instructions:
// 1. Go to https://cloudinary.com/ and create an account
// 2. Get your cloud name from the dashboard
// 3. Create an upload preset:
//    - Go to Settings > Upload
//    - Scroll to Upload presets
//    - Click "Add upload preset"
//    - Set signing mode to "Unsigned"
//    - Save the preset name
// 4. Get your API key and secret:
//    - Go to Settings > Access Keys
//    - Copy your API Key and API Secret
// 5. Replace the values above with your actual credentials
// 
// Note: For security, in production you should store these values in environment variables
// and not commit them to version control.
