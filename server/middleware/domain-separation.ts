import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export interface DomainContext {
  type: 'SUPER_ADMIN' | 'HOTEL_ADMIN' | 'PUBLIC_PORTAL';
  hotelSlug?: string;
  hotel?: any;
}

declare global {
  namespace Express {
    interface Request {
      domainContext?: DomainContext;
    }
  }
}

export function domainSeparationMiddleware(req: Request, res: Response, next: NextFunction) {
  const host = req.get('Host') || req.headers.host || 'localhost:5000';
  const subdomain = host.split('.')[0];

  // Super Admin domain
  if (host.includes('admin.luxuryhotelsaas.com') || subdomain === 'admin') {
    req.domainContext = {
      type: 'SUPER_ADMIN'
    };
    return next();
  }

  // API domain - allow all requests
  if (host.includes('api.luxuryhotelsaas.com') || subdomain === 'api') {
    return next();
  }

  // Hotel-specific domain
  if (host.includes('.luxuryhotelsaas.com') && subdomain !== 'www') {
    req.domainContext = {
      type: 'HOTEL_ADMIN',
      hotelSlug: subdomain
    };
    return next();
  }

  // Default to public portal for development
  if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('.replit.dev')) {
    return next();
  }

  // Custom domain - check if it belongs to a hotel
  storage.getHotels().then(hotels => {
    const hotel = hotels.find(h => h.domain === host);
    if (hotel) {
      req.domainContext = {
        type: 'PUBLIC_PORTAL',
        hotelSlug: hotel.slug,
        hotel
      };
    }
    next();
  }).catch(err => {
    console.error('Domain resolution error:', err);
    next();
  });
}

export function requireSuperAdminDomain(req: Request, res: Response, next: NextFunction) {
  if (req.domainContext?.type !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied. Super Admin domain required.' 
    });
  }
  next();
}

export function requireHotelDomain(req: Request, res: Response, next: NextFunction) {
  if (!req.domainContext?.hotelSlug) {
    return res.status(403).json({ 
      error: 'Access denied. Hotel domain required.' 
    });
  }
  next();
}