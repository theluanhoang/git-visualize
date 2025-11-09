import { Injectable } from '@nestjs/common';

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  isBot: boolean;
}

export interface LocationInfo {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  isp?: string;
}

@Injectable()
export class DeviceTrackingService {
  constructor() {}

  parseUserAgent(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();
    
    // Browser detection
    let browser = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'Chrome';
      const match = ua.match(/chrome\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
      const match = ua.match(/firefox\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari';
      const match = ua.match(/version\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('edg')) {
      browser = 'Edge';
      const match = ua.match(/edg\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }

    // OS detection
    let os = 'Unknown';
    let osVersion = 'Unknown';
    
    if (ua.includes('windows')) {
      os = 'Windows';
      if (ua.includes('windows nt 10.0')) osVersion = '10';
      else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
      else if (ua.includes('windows nt 6.2')) osVersion = '8';
      else if (ua.includes('windows nt 6.1')) osVersion = '7';
    } else if (ua.includes('mac os x')) {
      os = 'macOS';
      const match = ua.match(/mac os x (\d+[._]\d+)/);
      osVersion = match ? match[1].replace('_', '.') : 'Unknown';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('android')) {
      os = 'Android';
      const match = ua.match(/android (\d+\.\d+)/);
      osVersion = match ? match[1] : 'Unknown';
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      os = ua.includes('ipad') ? 'iPadOS' : 'iOS';
      const match = ua.match(/os (\d+[._]\d+)/);
      osVersion = match ? match[1].replace('_', '.') : 'Unknown';
    }

    // Device type detection
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      deviceType = 'mobile';
    } else if (ua.includes('ipad') || ua.includes('tablet')) {
      deviceType = 'tablet';
    }

    // Bot detection
    const isBot = ua.includes('bot') || ua.includes('crawler') || ua.includes('spider');

    return {
      browser,
      browserVersion,
      os,
      osVersion,
      deviceType,
      isBot,
    };
  }

  async getLocationFromIP(ip: string): Promise<LocationInfo> {
    // In production, you would use a service like:
    // - ipapi.co
    // - ipinfo.io
    // - MaxMind GeoIP2
    // - CloudFlare CF-IPCountry header
    
    // For now, return basic info
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown',
      isp: 'Unknown',
    };
  }

  async updateSessionWithDeviceInfo(sessionId: string, userAgent: string, ip: string) {
    const deviceInfo = this.parseUserAgent(userAgent);
    const locationInfo = await this.getLocationFromIP(ip);
    
    // Log device info for debugging
    console.log('Device Info:', deviceInfo);
    console.log('Location Info:', locationInfo);
    
    // Return device info for external use
    return {
      deviceInfo,
      locationInfo,
      sessionId,
    };
  }
}
