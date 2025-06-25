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

// Generate a unique filename only when there's a conflict
const generateUniqueFilename = (originalname, attempt = 1) => {
  // Since we're now receiving sanitized filenames, no need for encoding fixes
  const extension = path.extname(originalname);
  const nameWithoutExt = path.basename(originalname, extension);
  
  if (attempt === 1) {
    return originalname; // First attempt uses original name
  }
  
  return `${nameWithoutExt}(${attempt})${extension}`;
};

// Check if a file exists in MinIO
const fileExists = async (filename, bucketName = process.env.MINIO_BUCKET_NAME || 'media') => {
  try {
    await minioClient.statObject(bucketName, filename);
    return true;
  } catch (error) {
    return false;
  }
};

// Upload a file to MinIO
const uploadFile = async (file, bucketName = process.env.MINIO_BUCKET_NAME || 'media', uploadPath = '', customFilename = null) => {
  try {
    let attempt = 1;
    let filename;
    let finalFilename;
    
    // Use custom filename if provided, otherwise use original filename
    const baseOriginalName = customFilename || file.originalname;
    
    // Keep trying until we find a filename that doesn't exist
    do {
      const baseFilename = generateUniqueFilename(baseOriginalName, attempt);
      
      // Construct the full filename with path
      if (uploadPath && uploadPath.trim()) {
        // Ensure the path doesn't start with a slash and ends with a slash if not empty
        const cleanPath = uploadPath.trim().replace(/^\/+/, '').replace(/\/+$/, '');
        finalFilename = cleanPath ? `${cleanPath}/${baseFilename}` : baseFilename;
      } else {
        finalFilename = baseFilename;
      }
      
      const exists = await fileExists(finalFilename, bucketName);
      if (!exists) {
        filename = finalFilename;
        break;
      }
      
      attempt++;
    } while (attempt <= 100); // Prevent infinite loop
    
    if (!filename) {
      throw new Error('Could not generate unique filename after 100 attempts');
    }
    
    // Ensure bucket exists before uploading
    await ensureBucketExists(bucketName);
    
    await minioClient.putObject(
      bucketName,
      filename,
      file.buffer,
      file.buffer.length,
      { 'Content-Type': file.mimetype }
    );
    
    // Generate URL for the uploaded file
    const fileUrl = getFileUrl(filename, bucketName);
    
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
const deleteFile = async (filename, bucketName = process.env.MINIO_BUCKET_NAME || 'media') => {
  try {
    // Ensure bucket exists before trying to delete
    await ensureBucketExists(bucketName);
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

// Generate URL for a file
const getFileUrl = (filename, bucketName = process.env.MINIO_BUCKET_NAME || 'media') => {
  // Check if there's a custom public URL prefix for serving files
  if (process.env.MINIO_PUBLIC_URL_PREFIX) {
    return `${process.env.MINIO_PUBLIC_URL_PREFIX}/${filename}`;
  }
  
  // Default to direct MinIO URL
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const port = process.env.MINIO_USE_SSL === 'true' ? '' : `:${process.env.MINIO_PORT}`;
  return `${protocol}://${process.env.MINIO_ENDPOINT}${port}/${bucketName}/${filename}`;
};

// List all files in a bucket
const listFiles = async (bucketName = process.env.MINIO_BUCKET_NAME || 'media') => {
  try {
    // Ensure bucket exists before listing
    await ensureBucketExists(bucketName);
    
    const files = [];
    const stream = minioClient.listObjects(bucketName, '', true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        files.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          etag: obj.etag,
          url: getFileUrl(obj.name, bucketName)
        });
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
      
      stream.on('end', () => {
        resolve(files);
      });
    });
  } catch (error) {
    console.error('Error listing files from MinIO:', error);
    throw error;
  }
};

// Get file statistics/info
const getFileInfo = async (filename, bucketName = process.env.MINIO_BUCKET_NAME || 'media') => {
  try {
    const stat = await minioClient.statObject(bucketName, filename);
    return {
      name: filename,
      size: stat.size,
      lastModified: stat.lastModified,
      etag: stat.etag,
      contentType: stat.metaData['content-type'],
      url: getFileUrl(filename, bucketName)
    };
  } catch (error) {
    console.error('Error getting file info from MinIO:', error);
    throw error;
  }
};

module.exports = {
  minioClient,
  uploadFile,
  deleteFile,
  ensureBucketExists,
  listFiles,
  getFileInfo,
  getFileUrl,
  fileExists,
};