const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Helper to format phone number
const formatPhoneNumber = (phone) => {
  // Remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Add +91 if not present (India code)
  if (!cleaned.startsWith('+')) {
    cleaned = '+91' + cleaned;
  }
  
  return cleaned;
};

// Send SMS function
const sendSMS = async (phoneNumber, message) => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });
    
    console.log(`SMS sent successfully to ${formattedNumber}. SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

// SMS Templates
const SMS_TEMPLATES = {
  
  // 1. Application Fee Payment Success
  applicationFeeSuccess: (studentName, applicationId) => {
    return `Dear ${studentName},
Your application fee payment is successful! 
Application ID: ${applicationId}
Your documents are under review. We'll notify you about the interview date soon.
- TIE College`;
  },
  
  // 2. Interview Scheduled
  interviewScheduled: (studentName, applicationId, interviewDate) => {
    const formattedDate = new Date(interviewDate).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    return `Dear ${studentName},
Your interview/exam is scheduled!
Date & Time: ${formattedDate}
Application ID: ${applicationId}
Please be on time. Best wishes!
- TIE College`;
  },
  
  // 3. Merit List Generated
  meritListGenerated: (studentName, applicationId, status) => {
    return `Dear ${studentName},
Merit list has been published!
Application ID: ${applicationId}
Status: ${status.toUpperCase()}
Check your dashboard for details.
- TIE College`;
  },
  
  // 4. Selected - Admission Fee Payment
  selectionNotification: (studentName, applicationId, paymentLink) => {
    return `🎉 Congratulations ${studentName}!
You've been SELECTED for admission!
Application ID: ${applicationId}
Pay admission fees to confirm your seat: ${paymentLink}
Hurry! Limited time offer.
- TIE College`;
  },
  
  // 5. Waitlisted
  waitlistNotification: (studentName, applicationId) => {
    return `Dear ${studentName},
You've been placed on the WAITLIST.
Application ID: ${applicationId}
We'll notify you if a seat becomes available.
- TIE College`;
  },
  
  // 6. Rejected
  rejectionNotification: (studentName, applicationId) => {
    return `Dear ${studentName},
Thank you for applying to TIE College.
Application ID: ${applicationId}
Unfortunately, we cannot offer admission at this time. We encourage you to apply again next year.
- TIE College`;
  },
  
  // 7. Document Verification Success
  documentVerified: (studentName, applicationId) => {
    return `Dear ${studentName},
Your documents have been VERIFIED successfully!
Application ID: ${applicationId}
Interview date will be shared soon.
- TIE College`;
  },
  
  // 8. Additional Documents Requested
  additionalDocumentsRequired: (studentName, applicationId, reason) => {
    return `Dear ${studentName},
Additional documents required!
Application ID: ${applicationId}
Reason: ${reason}
Please upload ASAP via your dashboard.
- TIE College`;
  }
};

// Export functions
module.exports = {
  sendSMS,
  SMS_TEMPLATES
};