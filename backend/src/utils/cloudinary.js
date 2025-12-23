import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      resource_type: 'image',
      folder: "medical-records"
    });
    
    fs.unlinkSync(localFilePath);
    return response;
    
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
    
  } catch (error) {
    console.error('Error deleting from cloudinary:', error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };