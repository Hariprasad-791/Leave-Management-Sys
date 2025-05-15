import dotenv from 'dotenv';
dotenv.config();


import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'leave-docs',
    resource_type: 'raw', // ✅ Upload as raw to support PDF
    allowed_formats: ['pdf'], // ✅ Restrict to PDF only
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // optional: custom filename
  },
});


// Optional: Multer filter to reject non-PDFs before uploading
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};


const upload = multer({ storage, fileFilter });


export default upload;