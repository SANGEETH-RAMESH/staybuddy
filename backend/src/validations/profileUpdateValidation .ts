import * as Yup from 'yup';

export const profileUpdateValidation = Yup.object({
    name: Yup.string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(15,"Name cannot be more than 15 characters")
        .matches(/^[A-Za-z]+( [A-Za-z]+)*$/, 'Invalid name format')
        .required("Please enter your name"),

    mobile: Yup.string()
        .trim()
        .matches(/^[6-9][0-9]{9}$/, "Mobile number must start with a digit between 6 and 9 and be 10 digits long")
        .test('no-consecutive-zeros', 'Mobile number cannot contain more than 5 consecutive zeros', value => {
            if (value) {
                return !/^0{6,}$/.test(value);
            }
            return true;
        })
        .required("Please enter your mobile number"),
});
