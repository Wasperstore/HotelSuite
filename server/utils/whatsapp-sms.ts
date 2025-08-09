import { storage } from '../storage';

export interface MessageTemplate {
  name: string;
  content: string;
  variables?: string[];
}

export const MESSAGE_TEMPLATES: Record<string, MessageTemplate> = {
  BOOKING_CONFIRMATION: {
    name: 'Booking Confirmation',
    content: `🏨 *{{hotelName}}* Booking Confirmed!

Hello {{guestName}},

Your reservation is confirmed:
📅 Check-in: {{checkinDate}}
📅 Check-out: {{checkoutDate}}
🏠 Room: {{roomNumber}} ({{roomType}})
💰 Total: ₦{{totalAmount}}

Booking ID: {{bookingId}}

We look forward to hosting you!

Need help? Reply to this message or call us.`,
    variables: ['hotelName', 'guestName', 'checkinDate', 'checkoutDate', 'roomNumber', 'roomType', 'totalAmount', 'bookingId']
  },

  CHECK_IN_REMINDER: {
    name: 'Check-in Reminder',
    content: `🏨 *{{hotelName}}* Check-in Reminder

Hello {{guestName}},

Your check-in is tomorrow at {{checkinTime}}.

📍 Address: {{hotelAddress}}
🚗 Parking: Available
📱 Express Check-in: {{checkinQRLink}}

Looking forward to your arrival!`,
    variables: ['hotelName', 'guestName', 'checkinTime', 'hotelAddress', 'checkinQRLink']
  },

  ROOM_READY: {
    name: 'Room Ready',
    content: `✅ Your room is ready!

Hello {{guestName}},

Room {{roomNumber}} is now prepared for your arrival.

🔑 Digital Key: {{digitalKeyLink}}
📱 Room Service: {{roomServiceQR}}
🍽️ Menu: {{menuQRLink}}

Enjoy your stay at *{{hotelName}}*!`,
    variables: ['guestName', 'roomNumber', 'digitalKeyLink', 'roomServiceQR', 'menuQRLink', 'hotelName']
  },

  PAYMENT_REMINDER: {
    name: 'Payment Reminder',
    content: `💳 *{{hotelName}}* Payment Reminder

Hello {{guestName}},

Your booking requires payment completion:

💰 Amount: ₦{{outstandingAmount}}
📅 Due: {{dueDate}}
🔗 Pay now: {{paymentLink}}

Secure your reservation today!`,
    variables: ['hotelName', 'guestName', 'outstandingAmount', 'dueDate', 'paymentLink']
  },

  CHECKOUT_THANKS: {
    name: 'Thank You',
    content: `🙏 Thank you for staying with us!

Hello {{guestName}},

We hope you enjoyed your stay at *{{hotelName}}*.

⭐ Please rate your experience: {{reviewLink}}
🎁 Next visit: 10% discount code {{discountCode}}

We look forward to welcoming you back!`,
    variables: ['guestName', 'hotelName', 'reviewLink', 'discountCode']
  }
};

export interface SendMessageParams {
  recipient: string;
  templateName: string;
  variables: Record<string, string>;
  messageType: 'WHATSAPP' | 'SMS';
  hotelId: string;
  bookingId?: string;
}

export async function sendMessage(params: SendMessageParams): Promise<{success: boolean; messageId?: string; error?: string}> {
  const { recipient, templateName, variables, messageType, hotelId, bookingId } = params;
  
  // Get template
  const template = MESSAGE_TEMPLATES[templateName];
  if (!template) {
    return { success: false, error: 'Template not found' };
  }
  
  // Replace variables in template
  let content = template.content;
  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  // Log message to database
  const messageLog = await storage.createMessageLog({
    hotelId,
    bookingId,
    recipient,
    messageType,
    template: templateName,
    content,
    status: 'pending'
  });
  
  try {
    let messageId: string;
    
    if (messageType === 'WHATSAPP') {
      messageId = await sendWhatsAppMessage(recipient, content);
    } else {
      messageId = await sendSMSMessage(recipient, content);
    }
    
    // Update message log with success
    await storage.updateMessageLog(messageLog.id, {
      status: 'sent',
      messageId,
      sentAt: new Date()
    });
    
    return { success: true, messageId };
    
  } catch (error) {
    // Update message log with error
    await storage.updateMessageLog(messageLog.id, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Message sending failed'
    };
  }
}

async function sendWhatsAppMessage(recipient: string, content: string): Promise<string> {
  // WhatsApp Business API integration
  // This would integrate with providers like:
  // - Meta WhatsApp Business API
  // - Twilio WhatsApp API
  // - 360dialog
  
  console.log('\n📱 WHATSAPP MESSAGE (Development Mode)');
  console.log('=====================================');
  console.log(`To: ${recipient}`);
  console.log('Message:');
  console.log(content);
  console.log('=====================================\n');
  
  // Simulate successful send
  return `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function sendSMSMessage(recipient: string, content: string): Promise<string> {
  // SMS API integration
  // This would integrate with providers like:
  // - Twilio SMS
  // - Nigeria SMS providers
  // - AWS SNS
  
  console.log('\n📧 SMS MESSAGE (Development Mode)');
  console.log('=================================');
  console.log(`To: ${recipient}`);
  console.log('Message:');
  console.log(content);
  console.log('=================================\n');
  
  // Simulate successful send
  return `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to send booking confirmation
export async function sendBookingConfirmation(params: {
  booking: any;
  hotel: any;
  room: any;
  guestPhone: string;
  messageType: 'WHATSAPP' | 'SMS';
}) {
  const { booking, hotel, room, guestPhone, messageType } = params;
  
  return sendMessage({
    recipient: guestPhone,
    templateName: 'BOOKING_CONFIRMATION',
    variables: {
      hotelName: hotel.name,
      guestName: booking.guestName,
      checkinDate: booking.checkinDate.toLocaleDateString(),
      checkoutDate: booking.checkoutDate.toLocaleDateString(),
      roomNumber: room.number,
      roomType: room.type.replace('_', ' '),
      totalAmount: booking.totalAmount?.toLocaleString() || '0',
      bookingId: booking.id.slice(-8).toUpperCase()
    },
    messageType,
    hotelId: hotel.id,
    bookingId: booking.id
  });
}

// Helper function to send check-in reminder
export async function sendCheckInReminder(params: {
  booking: any;
  hotel: any;
  guestPhone: string;
  messageType: 'WHATSAPP' | 'SMS';
}) {
  const { booking, hotel, guestPhone, messageType } = params;
  
  return sendMessage({
    recipient: guestPhone,
    templateName: 'CHECK_IN_REMINDER',
    variables: {
      hotelName: hotel.name,
      guestName: booking.guestName,
      checkinTime: '2:00 PM',
      hotelAddress: 'Victoria Island, Lagos', // This should come from hotel data
      checkinQRLink: `${process.env.BASE_URL}/checkin/${booking.id}`
    },
    messageType,
    hotelId: hotel.id,
    bookingId: booking.id
  });
}