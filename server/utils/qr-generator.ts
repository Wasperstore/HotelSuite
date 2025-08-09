import { storage } from '../storage';

export interface QRCodeData {
  type: 'MENU' | 'CHECKIN' | 'ROOM_SERVICE' | 'WIFI';
  hotelId: string;
  roomId?: string;
  data: any;
}

export async function generateQRCode(params: QRCodeData): Promise<string> {
  const { type, hotelId, roomId, data } = params;
  
  // Generate unique code
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const code = `${type.toLowerCase()}_${timestamp}_${random}`;
  
  // Store in database
  try {
    await storage.createQRCode({
      hotelId,
      roomId,
      type,
      code,
      data: JSON.stringify(data),
      isActive: true
    });
    
    return code;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR code generation failed');
  }
}

export function generateMenuQRCode(hotelId: string, menuData?: any) {
  return generateQRCode({
    type: 'MENU',
    hotelId,
    data: {
      title: 'Hotel Menu',
      description: 'Scan to view our digital menu and place orders',
      menu: menuData || {
        categories: [
          {
            name: 'Breakfast',
            items: [
              { name: 'Continental Breakfast', price: 5000, description: 'Eggs, toast, coffee' },
              { name: 'Nigerian Breakfast', price: 4500, description: 'Yam, plantain, eggs' }
            ]
          },
          {
            name: 'Main Courses', 
            items: [
              { name: 'Jollof Rice', price: 3500, description: 'Spicy Nigerian rice with chicken' },
              { name: 'Grilled Fish', price: 6000, description: 'Fresh fish with sides' }
            ]
          }
        ]
      }
    }
  });
}

export function generateRoomServiceQRCode(hotelId: string, roomId: string) {
  return generateQRCode({
    type: 'ROOM_SERVICE',
    hotelId,
    roomId,
    data: {
      title: 'Room Service',
      description: 'Order room service directly to your room',
      services: [
        'Food & Beverage',
        'Housekeeping',
        'Maintenance',
        'Concierge',
        'Laundry'
      ]
    }
  });
}

export function generateCheckInQRCode(hotelId: string, roomId?: string) {
  return generateQRCode({
    type: 'CHECKIN',
    hotelId,
    roomId,
    data: {
      title: 'Express Check-in',
      description: 'Complete your check-in process digitally',
      instructions: [
        'Scan this code',
        'Verify your booking details',
        'Upload ID document',
        'Complete digital signature',
        'Receive your digital room key'
      ]
    }
  });
}

export function generateWiFiQRCode(hotelId: string, wifiDetails: { ssid: string; password: string; security?: string }) {
  const { ssid, password, security = 'WPA' } = wifiDetails;
  
  return generateQRCode({
    type: 'WIFI',
    hotelId,
    data: {
      title: 'WiFi Access',
      ssid,
      password,
      security,
      qrString: `WIFI:T:${security};S:${ssid};P:${password};H:false;`
    }
  });
}

// QR Code validation
export async function validateQRCode(code: string): Promise<{valid: boolean; data?: any; error?: string}> {
  try {
    const qrCode = await storage.getQRCodeByCode(code);
    
    if (!qrCode) {
      return { valid: false, error: 'QR code not found' };
    }
    
    if (!qrCode.isActive) {
      return { valid: false, error: 'QR code is no longer active' };
    }
    
    // Check if QR code is expired (optional - implement expiration logic)
    const createdAt = new Date(qrCode.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 365) { // 1 year expiration
      return { valid: false, error: 'QR code has expired' };
    }
    
    return { 
      valid: true, 
      data: {
        ...qrCode,
        parsedData: JSON.parse(qrCode.data || '{}')
      }
    };
  } catch (error) {
    console.error('QR code validation error:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

// Generate QR code SVG (simple implementation)
export function generateQRCodeSVG(data: string, size: number = 200): string {
  // This is a simplified SVG QR code generator
  // In production, use a proper QR code library like 'qrcode'
  
  const cellSize = size / 25; // 25x25 grid
  const cells: boolean[][] = [];
  
  // Generate a simple pattern based on data hash
  const hash = simpleHash(data);
  for (let i = 0; i < 25; i++) {
    cells[i] = [];
    for (let j = 0; j < 25; j++) {
      cells[i][j] = (hash * (i + 1) * (j + 1)) % 3 === 0;
    }
  }
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      if (cells[i][j]) {
        svg += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }
  
  svg += '</svg>';
  return svg;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}