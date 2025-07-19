// Email sending utility using EmailJS
// This is a free email sending service with 200 emails/month free tier

export interface EmailData {
  to_email: string;
  subject: string;
  message_html: string;
}

export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string }> {
  try {
    // Using EmailJS service which doesn't require backend
    const serviceId = 'service_ux_analyzer'; // You'll need to create this in EmailJS
    const templateId = 'template_ux_analyzer'; // You'll need to create this in EmailJS
    const userId = 'YOUR_USER_ID'; // You'll need to register and get this from EmailJS
    
    const templateParams = {
      to_email: emailData.to_email,
      subject: emailData.subject,
      message_html: emailData.message_html,
    };

    // If we're in a development environment without EmailJS access, simulate success
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Email would be sent with these parameters:', templateParams);
      return { 
        success: true, 
        message: 'Email sending simulated in development mode. Check console for details.' 
      };
    }

    // In production, we would make the actual API call
    const response = await fetch(`https://api.emailjs.com/api/v1.0/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      return { success: true, message: 'Email sent successfully!' };
    } else {
      const errorText = await response.text();
      return { success: false, message: `Failed to send email: ${errorText}` };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: `Error sending email: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// Alternative implementation using SMTP.js (another client-side option)
export async function sendEmailSMTP(emailData: EmailData): Promise<{ success: boolean; message: string }> {
  try {
    // This would be configured with your actual SMTP details
    /* 
    Email.send({
      SecureToken: "your-secure-token", // from SMTPjs.com
      To: emailData.to_email,
      From: "your-email@gmail.com", // sender email
      Subject: emailData.subject,
      Body: emailData.message_html
    }).then(message => {
      if (message === "OK") {
        return { success: true, message: "Email sent successfully!" };
      } else {
        return { success: false, message: `Failed to send email: ${message}` };
      }
    });
    */

    // For now, simulate success in development
    console.log('SMTP: Email would be sent with these parameters:', emailData);
    return { 
      success: true, 
      message: 'Email sending simulated (SMTP). Check console for details.' 
    };
  } catch (error) {
    console.error('Error sending email via SMTP:', error);
    return { success: false, message: `Error sending email: ${error instanceof Error ? error.message : String(error)}` };
  }
}