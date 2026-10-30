import { v2 as cloudinary } from "cloudinary";

export const uploadImageBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      if (!result?.secure_url) {
        reject(new Error("Image upload did not return a secure URL."));
        return;
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    }).end(buffer);
  });
