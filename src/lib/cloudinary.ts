import { CLOUDINARY_CONFIG } from './cloudinary-config';

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  bytes: number;
  format: string;
  width?: number;
  height?: number;
}

export interface CloudinaryDeleteResponse {
  result: string;
}

export interface CloudinaryTransformations {
  crop?: string;
  width?: number;
  height?: number;
  gravity?: string;
  quality?: string | number;
  format?: string;
  effect?: string;
  radius?: number;
  angle?: number;
  overlay?: string;
  underlay?: string;
  opacity?: number;
  border?: string;
  background?: string;
  color?: string;
  fetch_format?: string;
  [key: string]: string | number | undefined;
}

export class CloudinaryService {
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
  }

  /**
   * Upload a file to Cloudinary
   * @param file - The file to upload
   * @param folder - The folder path in Cloudinary
   * @param onProgress - Optional progress callback
   * @returns Promise with upload response
   */
  async uploadFile(
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResponse> {
    return new Promise((resolve, reject) => {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', folder);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              public_id: response.public_id,
              secure_url: response.secure_url,
              bytes: response.bytes,
              format: response.format,
              width: response.width,
              height: response.height,
            });
          } catch (error) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      // Send the request
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`);
      xhr.send(formData);
    });
  }

  /**
   * Delete a file from Cloudinary using server-side API
   * Note: This requires a server-side implementation for security
   * @param publicId - The public ID of the file to delete
   * @returns Promise with delete response
   */
  async deleteFile(publicId: string): Promise<CloudinaryDeleteResponse> {
    try {
      const response = await fetch(`${this.serverUrl}/api/cloudinary/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Delete failed with status: ${response.status}`);
      }

      const result = await response.json();
      return { result: result.result };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * Get optimized URL for an image
   * @param publicId - The public ID of the image
   * @param options - Optimization options
   * @returns Optimized URL
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}): string {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    const transformations = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);

    const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
    return `${baseUrl}/${transformString}${publicId}`;
  }

  /**
   * Transform an image URL with specific transformations
   * @param publicId - The public ID of the image
   * @param transformations - Cloudinary transformations
   * @returns Transformed URL
   */
  getTransformedUrl(publicId: string, transformations: CloudinaryTransformations = {}): string {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    const transformArray = [];

    Object.entries(transformations).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'fetch_format') {
          transformArray.push(`f_${value}`);
        } else if (key === 'quality') {
          transformArray.push(`q_${value}`);
        } else if (key === 'crop') {
          transformArray.push(`c_${value}`);
        } else if (key === 'gravity') {
          transformArray.push(`g_${value}`);
        } else if (key === 'effect') {
          transformArray.push(`e_${value}`);
        } else if (key === 'radius') {
          transformArray.push(`r_${value}`);
        } else if (key === 'angle') {
          transformArray.push(`a_${value}`);
        } else if (key === 'opacity') {
          transformArray.push(`o_${value}`);
        } else if (key === 'border') {
          transformArray.push(`bo_${value}`);
        } else if (key === 'background') {
          transformArray.push(`b_${value}`);
        } else if (key === 'color') {
          transformArray.push(`co_${value}`);
        } else if (key === 'width') {
          transformArray.push(`w_${value}`);
        } else if (key === 'height') {
          transformArray.push(`h_${value}`);
        } else {
          transformArray.push(`${key}_${value}`);
        }
      }
    });

    const transformString = transformArray.length > 0 ? transformArray.join(',') + '/' : '';
    return `${baseUrl}/${transformString}${publicId}`;
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();
