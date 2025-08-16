import * as Yup from 'yup'

export const signupValidation = Yup.object({
	name: Yup.string()
		.trim()
		.min(3, "Name must be at least 3 characters")
		.max(15,"Name cannot be more than 15 characters")
		.matches(/^[A-Za-z]+( [A-Za-z]+)*$/,'Invalid name format')
		.required("Please enter your name"),

	email: Yup.string()
		.trim()
		.matches(/^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
		.required("Please enter your email"),

	mobile: Yup.string()
		.trim()
		.length(10, "Mobile number must be exactly 10 digits")
		.matches(/^[6-9][0-9]{9}$/, "Mobile number must start with a digit between 6 and 9 and be 10 digits long")
		.test('no-consecutive-zeros', 'Mobile number cannot contain more than 5 consecutive zeros', value => {
			if (value) {
				return !/^0{6,}$/.test(value);
			}
			return true;
		})
		.required("Please enter your mobile number"),

	password: Yup.string()
		.trim()
		.min(8, "Password must be at least 8 characters")
		.max(15, "Password cannot be more than 15 characters")
		.matches(/[a-z]/, "Password must contain at least one lowercase letter")
		.matches(/[A-Z]/, "Password must contain at least one uppercase letter")
		.matches(/[0-9]/, "Password must contain at least one number")
		.matches(/[\W_]/, "Password must contain at least one special character")
		.required("Please enter your password"),

	// confirmPassword: Yup.string()
	// 	.trim()
	// 	.oneOf([Yup.ref("password")], "Passwords must match")
	// 	.required("Please confirm your password"),
});

export const otpValidation = Yup.object({
	otp: Yup.string()
		.trim()
		.length(4, "OTP must be 4 digits")
		.matches(/^[0-9]+$/, "OTP must be digits only")
		.required("Please enter the OTP"),
});

export const signInValidation = Yup.object({
	email: Yup.string()
		.trim()
		.matches(/^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
		.required("Please enter your email"),

	password: Yup.string()
		.trim()
		.required("Please enter your password"),
});

export const forgotPasswordValidation = Yup.object({
	email: Yup.string()
		.trim()
		.matches(/^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
		.required("Please enter your email"),
});

export const resetPasswordValidation = Yup.object({
	newPassword: Yup.string()
		.trim()
		.min(8, "Password must be at least 8 characters")
		.matches(/[a-z]/, "Password must contain at least one lowercase letter")
		.matches(/[A-Z]/, "Password must contain at least one uppercase letter")
		.matches(/[0-9]/, "Password must contain at least one number")
		.matches(/[\W_]/, "Password must contain at least one special character")
		.required("Please enter your password"),

	confirmPassword: Yup.string()
		.trim()
		.oneOf([Yup.ref("newPassword")], "Passwords must match")
		.required("Please confirm your password"),
});
