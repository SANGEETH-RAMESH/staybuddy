import * as Yup from 'yup';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; 


export const categoryValidation = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[A-Za-z ]+$/, 'Name cannot contain special characters or numbers')
    .required('Category name is required'),

  image: Yup.object({
    mimetype: Yup.string()
      .oneOf(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], 'Please select a valid image file (JPG, PNG, WEBP)')
      .required(),
    size: Yup.number()
      .max(MAX_IMAGE_SIZE, 'Image size must be less than 2MB')
      .required(),
  }).required('Category image is required'),
});