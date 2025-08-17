import crypto from 'crypto';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createInviteEmail(params: {
  hotelName: string;
  recipientName: string;
  role: string;
  tempPassword: string;
  inviteLink: string;
}): EmailTemplate {
  const { hotelName, recipientName, role, tempPassword, inviteLink } = params;
  
  const subject = `Welcome to ${hotelName} - Hotel Management System`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1A237E 0%, #3F51B5 100%); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .credentials { background: white; padding: 20px; border-left: 4px solid #FFD700; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #1A237E; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏨 Welcome to wasper</h1>
                <p>Your hotel management journey begins here</p>
            </div>
            
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                
                <p>You've been invited to join <strong>${hotelName}</strong> as a <strong>${role.replace('_', ' ')}</strong>.</p>
                
                <div class="credentials">
                    <h3>🔑 Your Login Credentials</h3>
                    <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
                    <p style="color: #d32f2f; font-size: 14px;">
                        ⚠️ You'll be required to change this password on your first login for security.
                    </p>
                </div>
                
                <p>Click the button below to access your dashboard:</p>
                <a href="${inviteLink}" class="button">Access Dashboard →</a>
                
                <h3>What's Next?</h3>
                <ul>
                    <li>Click the link above to log in</li>
                    <li>Change your temporary password</li>
                    <li>Explore your dashboard features</li>
                    <li>Contact your hotel administrator if you need help</li>
                </ul>
                
                <p>If you have any questions, please don't hesitate to reach out to your hotel administrator.</p>
            </div>
            
            <div class="footer">
                <p>This invitation was sent by ${hotelName} via wasper</p>
                <p>If you didn't expect this invitation, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const text = `
Welcome to wasper!

Hello ${recipientName},

You've been invited to join ${hotelName} as a ${role.replace('_', ' ')}.

Your temporary login credentials:
Password: ${tempPassword}

IMPORTANT: You'll be required to change this password on your first login for security.

Access your dashboard: ${inviteLink}

What's next:
1. Click the link above to log in
2. Change your temporary password
3. Explore your dashboard features
4. Contact your hotel administrator if you need help

If you have any questions, please reach out to your hotel administrator.

This invitation was sent by ${hotelName} via wasper.
If you didn't expect this invitation, please ignore this email.
  `;
  
  return { subject, html, text };
}

export function createPasswordResetEmail(params: {
  recipientName: string;
  resetLink: string;
  hotelName?: string;
}): EmailTemplate {
  const { recipientName, resetLink, hotelName } = params;
  
  const subject = `Password Reset - ${hotelName || 'wasper'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1A237E 0%, #3F51B5 100%); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: #d32f2f; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Password Reset</h1>
                <p>Secure your account</p>
            </div>
            
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                
                <a href="${resetLink}" class="button">Reset Password →</a>
                
                <div class="warning">
                    <p><strong>⏰ This link expires in 1 hour</strong></p>
                    <p>For security reasons, this reset link can only be used once.</p>
                </div>
                
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                
                <p>For security questions, contact your administrator.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent by ${hotelName || 'wasper'}</p>
                <p>Do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const text = `
Password Reset - ${hotelName || 'wasper'}

Hello ${recipientName},

We received a request to reset your password. 

Reset your password: ${resetLink}

IMPORTANT: This link expires in 1 hour and can only be used once.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

For security questions, contact your administrator.

This email was sent by ${hotelName || 'wasper'}.
Do not reply to this email.
  `;
  
  return { subject, html, text };
}

// Mock email sending function for development
export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  console.log('\n📧 EMAIL SENT (Development Mode)');
  console.log('=================================');
  console.log(`To: ${to}`);
  console.log(`Subject: ${template.subject}`);
  console.log('\nContent:');
  console.log(template.text);
  console.log('=================================\n');
  
  // In production, integrate with actual email service like:
  // - SendGrid
  // - AWS SES  
  // - Mailgun
  // - Resend
  
  return true; // Simulate successful send
}