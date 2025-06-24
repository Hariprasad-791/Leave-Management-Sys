import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Storage for documents (PDFs)
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'leave-docs',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Memory storage for Excel files (for processing)
const excelStorage = multer.memoryStorage();

// File filters
const documentFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const excelFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed!'), false);
  }
};

// Export different upload configurations
export const uploadDocument = multer({ storage: documentStorage, fileFilter: documentFilter });
export const uploadExcel = multer({ storage: excelStorage, fileFilter: excelFilter });

// Default export for backward compatibility
export default uploadDocument;
