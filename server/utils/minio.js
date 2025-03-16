const Minio = require('minio');
const path = require('path');
const crypto = require('crypto');

// Create a MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// Generate a unique filename
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  return `${timestamp}-${randomString}${extension}`;
};

// Upload a file to MinIO
const uploadFile = async (file, bucketName = 'media') => {
  try {
    const filename = generateUniqueFilename(file.originalname);
    
    await minioClient.putObject(
      bucketName,
      filename,
      file.buffer,
      file.buffer.length,
      { 'Content-Type': file.mimetype }
    );
    
    // Generate URL for the uploaded file
    const fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${filename}`;
    
    return {
      success: true,
      filename,
      url: fileUrl,
      mimetype: file.mimetype,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete a file from MinIO
const deleteFile = async (filename, bucketName = 'media') => {
  try {
    await minioClient.removeObject(bucketName, filename);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Check if a bucket exists, create it if it doesn't
const ensureBucketExists = async (bucketName) => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Bucket '${bucketName}' created successfully`);
    }
    return true;
  } catch (error) {
    console.error(`Error ensuring bucket '${bucketName}' exists:`, error);
    return false;
  }
};

module.exports = {
  minioClient,
  uploadFile,
  deleteFile,
  ensureBucketExists,
}; 