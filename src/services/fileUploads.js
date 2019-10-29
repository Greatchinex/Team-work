import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const processUpload = async file => {
  const { filename, createReadStream } = await file;

  try {
    const result = await new Promise((resolve, reject) => {
      createReadStream().pipe(
        cloudinary.v2.uploader.upload_stream((error, result) => {
          if (error) {
            reject(error);
          }

          resolve(result);
        })
      );
    });

    const newPhoto = { filename, path: result.secure_url };

    return newPhoto;
  } catch (err) {
    console.log(err);
  }
};
