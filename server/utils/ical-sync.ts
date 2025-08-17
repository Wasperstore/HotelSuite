import { storage } from '../storage';
import type { Booking } from '@shared/schema';

export interface OTABooking {
  id: string;
  platform: 'BOOKING_COM' | 'AIRBNB' | 'EXPEDIA' | 'AGODA';
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  totalAmount: number;
  currency: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  platformBookingId: string;
}

export interface ICalEvent {
  uid: string;
  summary: string;
  description: string;
  dtStart: Date;
  dtEnd: Date;
  location: string;
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  created: Date;
  lastModified: Date;
}

// Generate iCal feed for hotel bookings
export async function generateICalFeed(hotelId: string): Promise<string> {
  const hotel = await storage.getHotel(hotelId);
  if (!hotel) throw new Error('Hotel not found');

  const bookings = await storage.getBookingsByHotel(hotelId);
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//wasper//Hotel Management//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${hotel.name} - Bookings`,
    `X-WR-CALDESC:Hotel bookings for ${hotel.name}`,
    'X-WR-TIMEZONE:Africa/Lagos'
  ].join('\r\n');

  for (const booking of bookings) {
    const room = await storage.getRoomsByHotel(hotelId).then(rooms => 
      rooms.find(r => r.id === booking.roomId)
    );

    const event: ICalEvent = {
      uid: `booking-${booking.id}@luxuryhotelsaas.com`,
      summary: `${booking.guestName} - Room ${room?.number || 'TBD'}`,
      description: `Guest: ${booking.guestName}\\nEmail: ${booking.guestEmail}\\nPhone: ${booking.guestPhone || 'N/A'}\\nRoom: ${room?.type || 'TBD'}\\nTotal: ₦${booking.totalAmount?.toLocaleString() || '0'}`,
      dtStart: booking.checkinDate ? new Date(booking.checkinDate) : new Date(),
      dtEnd: booking.checkoutDate ? new Date(booking.checkoutDate) : new Date(),
      location: hotel.name,
      status: booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE',
      created: new Date(booking.createdAt),
      lastModified: new Date(booking.createdAt)
    };

    ical += '\r\n' + formatICalEvent(event);
  }

  ical += '\r\nEND:VCALENDAR';
  return ical;
}

function formatICalEvent(event: ICalEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string) => {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  };

  return [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.dtStart)}`,
    `DTEND:${formatDate(event.dtEnd)}`,
    `SUMMARY:${escapeText(event.summary)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    `STATUS:${event.status}`,
    `CREATED:${formatDate(event.created)}`,
    `LAST-MODIFIED:${formatDate(event.lastModified)}`,
    'END:VEVENT'
  ].join('\r\n');
}

// Parse iCal data from OTA platforms
export function parseICalFeed(icalData: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icalData.split(/\r\n|\n|\r/);
  
  let currentEvent: Partial<ICalEvent> | null = null;
  let inEvent = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (trimmedLine === 'END:VEVENT' && currentEvent) {
      if (isValidEvent(currentEvent)) {
        events.push(currentEvent as ICalEvent);
      }
      currentEvent = null;
      inEvent = false;
    } else if (inEvent && currentEvent && trimmedLine.includes(':')) {
      const [key, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':');
      
      switch (key) {
        case 'UID':
          currentEvent.uid = value;
          break;
        case 'SUMMARY':
          currentEvent.summary = unescapeText(value);
          break;
        case 'DESCRIPTION':
          currentEvent.description = unescapeText(value);
          break;
        case 'DTSTART':
          currentEvent.dtStart = parseICalDate(value);
          break;
        case 'DTEND':
          currentEvent.dtEnd = parseICalDate(value);
          break;
        case 'LOCATION':
          currentEvent.location = unescapeText(value);
          break;
        case 'STATUS':
          currentEvent.status = value as 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
          break;
        case 'CREATED':
          currentEvent.created = parseICalDate(value);
          break;
        case 'LAST-MODIFIED':
          currentEvent.lastModified = parseICalDate(value);
          break;
      }
    }
  }

  return events;
}

function parseICalDate(dateString: string): Date {
  // Handle YYYYMMDDTHHMMSSZ format
  const match = dateString.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    return new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    ));
  }
  
  // Fallback to Date constructor
  return new Date(dateString);
}

function unescapeText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function isValidEvent(event: Partial<ICalEvent>): event is ICalEvent {
  return !!(
    event.uid &&
    event.summary &&
    event.description &&
    event.dtStart &&
    event.dtEnd &&
    event.location &&
    event.status &&
    event.created &&
    event.lastModified
  );
}

// Sync bookings from OTA iCal feeds
export async function syncOTABookings(hotelId: string, platform: string, icalUrl: string): Promise<{synced: number; errors: string[]}> {
  const errors: string[] = [];
  let syncedCount = 0;

  try {
    // Fetch iCal data from OTA platform
    const response = await fetch(icalUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal data: ${response.status}`);
    }

    const icalData = await response.text();
    const events = parseICalFeed(icalData);

    // Process each event
    for (const event of events) {
      try {
        // Skip cancelled events
        if (event.status === 'CANCELLED') continue;

        // Extract booking information from event
        const otaBooking = parseOTABookingFromEvent(event, platform);
        
        // Check if booking already exists
        const existingBooking = await findExistingOTABooking(hotelId, otaBooking.platformBookingId);
        
        if (!existingBooking) {
          // Create new booking
          await createBookingFromOTA(hotelId, otaBooking);
          syncedCount++;
        } else {
          // Update existing booking if modified
          const eventModified = event.lastModified.getTime();
          const bookingModified = new Date(existingBooking.createdAt).getTime();
          
          if (eventModified > bookingModified) {
            await updateBookingFromOTA(existingBooking.id, otaBooking);
            syncedCount++;
          }
        }
      } catch (error) {
        errors.push(`Event ${event.uid}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    errors.push(`Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { synced: syncedCount, errors };
}

function parseOTABookingFromEvent(event: ICalEvent, platform: string): OTABooking {
  // Extract guest information from summary and description
  const guestName = event.summary.split(' - ')[0] || 'Unknown Guest';
  
  // Parse email from description (basic implementation)
  const emailMatch = event.description.match(/Email:\s*([^\\\n]+)/);
  const phoneMatch = event.description.match(/Phone:\s*([^\\\n]+)/);
  const amountMatch = event.description.match(/Total:\s*₦([0-9,]+)/);

  return {
    id: event.uid,
    platform: platform.toUpperCase() as any,
    guestName,
    guestEmail: emailMatch?.[1]?.trim() || '',
    guestPhone: phoneMatch?.[1]?.trim(),
    checkIn: event.dtStart,
    checkOut: event.dtEnd,
    roomType: 'Standard', // Default, could be parsed from description
    totalAmount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
    currency: 'NGN',
    status: event.status === 'CONFIRMED' ? 'confirmed' : 'pending',
    platformBookingId: event.uid
  };
}

async function findExistingOTABooking(hotelId: string, platformBookingId: string): Promise<Booking | undefined> {
  const bookings = await storage.getBookingsByHotel(hotelId);
  return bookings.find(b => b.id.includes(platformBookingId));
}

async function createBookingFromOTA(hotelId: string, otaBooking: OTABooking): Promise<Booking> {
  // Find available room or create placeholder
  const rooms = await storage.getRoomsByHotel(hotelId);
  const availableRoom = rooms.find(r => r.status === 'available');

  return await storage.createBooking({
    hotelId,
    roomId: availableRoom?.id,
    guestName: otaBooking.guestName,
    guestEmail: otaBooking.guestEmail,
    guestPhone: otaBooking.guestPhone,
    checkinDate: otaBooking.checkIn,
    checkoutDate: otaBooking.checkOut,
    totalAmount: otaBooking.totalAmount.toString(),
    status: otaBooking.status
  });
}

async function updateBookingFromOTA(bookingId: string, otaBooking: OTABooking): Promise<Booking> {
  return await storage.updateBooking(bookingId, {
    guestName: otaBooking.guestName,
    guestEmail: otaBooking.guestEmail,
    guestPhone: otaBooking.guestPhone,
    checkinDate: otaBooking.checkIn,
    checkoutDate: otaBooking.checkOut,
    totalAmount: otaBooking.totalAmount.toString(),
    status: otaBooking.status
  });
}