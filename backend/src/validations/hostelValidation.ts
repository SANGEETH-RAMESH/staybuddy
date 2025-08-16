import * as Yup from 'yup';

export const hostelFormValidation = Yup.object({
    hostelname: Yup.string()
        .trim()
        .min(3, "Property name must be at least 3 characters")
        .max(25, "Property name cannot exceed 25 characters")
        .matches(/^[A-Za-z0-9\s]+$/, "Property name can only contain letters, numbers, and spaces")
        .required("Property name is required"),

    location: Yup.string()
        .trim()
        .min(5, "Location must be at least 5 characters")
        .max(150, "Location cannot be more than 150 characteres")
        .required("Location is required"),

    phone: Yup.string()
        .trim()
        .length(10, "Phone number must be exactly 10 digits")
        .matches(/^[6-9][0-9]{9}$/, "Phone number must start with 6-9 and be 10 digits")
        .required("Phone number is required"),

    nearbyaccess: Yup.string()
        .trim()
        .min(5, "Nearby access details must be at least 5 characters")
        .max(40, "Nearby access details cannot exceed 40 characters")
        .required("Nearby access details are required"),

    beds: Yup.string()
        .transform((v) => (v === '' ? undefined : v))
        .oneOf(['1', '2', '3', '4', '5', '6'], "Please select a valid number of beds")
        .required("Number of beds per room is required"),

    bookingType: Yup.string()
        .transform(v => v === '' ? undefined : v)
        .oneOf(['one month', 'one day'], "Please select a valid booking type")
        .required("Booking type is required"),
    policies: Yup.string()
        .transform(v => v === '' ? undefined : v)
        .oneOf(['bachelors', 'students'], "Please select a valid policy")
        .required("Policy selection is required"),

    category: Yup.string()
        .trim()
        .required("Category selection is required"),

    advanceamount: Yup.number()
        .transform((value, originalValue) => originalValue === '' ? undefined : value)
        .positive("Advance amount must be greater than 0")
        .integer("Advance amount must be a whole number")
        .min(1, "Advance amount must be at least 1")
        .max(100000, "Advance amount cannot exceed 1,00,000")
        .required("Advance amount is required"),

    cancellationPolicy: Yup.string()
        .oneOf(['freecancellation', 'no free cancellation'], "Please select a valid cancellation policy")
        .required("Cancellation policy is required"),

    bedShareRate: Yup.number()
        .transform((value, originalValue) => originalValue === '' ? undefined : value)
        .positive("Bed share rate must be greater than 0")
        .integer("Bed share rate must be a whole number")
        .min(1, "Bed share rate must be at least 1")
        .max(50000, "Bed share rate cannot exceed 50,000")
        .required("Bed share rate is required"),

    foodRate: Yup.number()
        .transform((value, originalValue) => originalValue === '' ? undefined : value)
        .when('facilities.food', {
            is: true,
            then: (schema) => schema
                .positive("Food rate must be greater than 0")
                .integer("Food rate must be a whole number")
                .min(1, "Food rate must be at least 1")
                .max(10000, "Food rate cannot exceed 10,000")
                .required("Food rate is required when food facility is selected"),
            otherwise: (schema) => schema.nullable()
        }),

    facilities: Yup.object({
        wifi: Yup.boolean(),
        laundry: Yup.boolean(),
        food: Yup.boolean()
    })
        .transform((value, originalValue) => {
            if (!originalValue || originalValue === '') {
                return { wifi: false, laundry: false, food: false };
            }
            return value;
        })
        .test('at-least-one-facility', 'Please select at least one facility', value => Object.values(value).some(Boolean)),

    photos: Yup.array()
        .transform((value, originalValue) => {
            if (!originalValue) return [];
            if (typeof originalValue === 'string') return [originalValue];
            return value;
        })
        .min(1, "Please upload at least one photo")
        .max(10, "You can upload maximum 10 photos")
        .required("Please upload at least one photo"),

    latitude: Yup.number()
        .transform((value, originalValue) => Number(originalValue))
        .min(-90, "Invalid latitude")
        .max(90, "Invalid latitude")
        .required("Location coordinates are required"),
    longitude: Yup.number()
        .transform((value, originalValue) => Number(originalValue))
        .min(-180, "Invalid longitude")
        .max(180, "Invalid longitude")
        .required("Location coordinates are required"),
});