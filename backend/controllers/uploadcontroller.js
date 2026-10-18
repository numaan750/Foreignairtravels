import { v2 as cloudinary } from 'cloudinary';

// POST /api/upload
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image select karo' });
  }

  // Config yahan hai kyunke dotenv imports ke baad load hota hai
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'foreignairtravel/packages' },
    (error, result) => {
      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
      res.status(201).json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    }
  );

  stream.end(req.file.buffer);
};