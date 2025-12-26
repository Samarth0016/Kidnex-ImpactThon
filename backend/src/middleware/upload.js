import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for medical reports (images and PDFs)
const medicalReportFilter = (req, file, cb) => {
  const allowedTypes = ['image/', 'application/pdf'];
  const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

// Upload middleware for single image
export const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
}).single('image');

// Upload middleware for multiple images
export const uploadMultipleImages = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024,
  },
  fileFilter: imageFilter,
}).array('images', 10); // Max 10 images

// Upload middleware for medical reports
export const uploadMedicalReport = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: medicalReportFilter,
}).single('report');

export default {
  uploadImage,
  uploadMultipleImages,
  uploadMedicalReport,
};
