import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Mailgen from 'mailgen'

dotenv.config();

// console.log(process.env.GOOGLE_GMAIL)
// console.log(process.env.GOOGLE_PASSWORD)
export const sendOtp = async (
    email: string,
    otp: number
): Promise<void> => {
    const config = {
        service: 'gmail',
        auth: {
            user: process.env.GOOGLE_GMAIL,
            pass: process.env.GOOGLE_PASSWORD
        }
    }


    const transporter = nodemailer.createTransport(config);

    const MailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Mailgen",
            link: 'http://mailgen.js/'
        }
    })
    const response = {
        body: {
            name: email,
            intro: `Your OTP is ${otp}`,
            outro: "Thank you"
        }
    }

    const mail = MailGenerator.generate(response)

    const message = {
        from: process.env.GOOGLE_GMAIL,
        to: email,
        subject: "Otp sent successfully",
        html: mail
    }

    transporter.sendMail(message)
}

export const sendApprovalOrRejectionMail = async (
    email: string,
    isApproved: boolean
  ): Promise<void> => {
    const config = {
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_GMAIL,
        pass: process.env.GOOGLE_PASSWORD,
      },
    };
  
    const transporter = nodemailer.createTransport(config);
  
    const MailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Mailgen',
        link: 'http://mailgen.js/',
      },
    });
  
    // Generate the message dynamically based on approval status
    const response = {
      body: {
        name: email,
        intro: isApproved
          ? 'Your request has been approved successfully.'
          : 'Your request has been rejected.',
        outro: isApproved
          ? 'Feel free to reach out if you have any questions.'
          : 'You can contact support for further clarification.',
      },
    };
  
    const mail = MailGenerator.generate(response);
  
    const message = {
      from: process.env.GOOGLE_GMAIL,
      to: email,
      subject: isApproved
        ? 'Approval Notification'
        : 'Rejection Notification',
      html: mail,
    };
  
    try {
      await transporter.sendMail(message);
      console.log('Mail sent successfully');
    } catch (error) {
      console.error('Error sending mail:', error);
      throw new Error('Mail delivery failed');
    }
  };