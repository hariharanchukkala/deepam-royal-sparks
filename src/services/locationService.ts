import { DetectedLocation } from '../types';

/**
 * Reverse geocodes coordinates (lat, lon) to city, area, state and pincode.
 * Uses Photon (OpenStreetMap) with fallback to Nominatim.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<Partial<DetectedLocation>> {
  // Method 1: Photon Komoot (Ultra-fast, CORS-friendly, OpenStreetMap based)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const props = data.features?.[0]?.properties;
      if (props) {
        const city = props.city || props.town || props.village || props.locality || props.district || props.county || '';
        const area = props.district || props.locality || props.street || props.suburb || '';
        const state = props.state || '';
        const pincode = props.postcode || '';
        const addressParts = [props.name, props.street, area, city, state].filter(Boolean);
        const address = addressParts.length > 0 ? addressParts.join(', ') : `${city}, ${state}`;

        if (city) {
          return {
            city,
            area,
            state,
            pincode,
            address: address || `${city}, ${state}`
          };
        }
      }
    }
  } catch {
    // Proceed to fallback
  }

  // Method 2: Nominatim OpenStreetMap
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' }
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.county ||
        addr.state_district ||
        '';
      const area = addr.suburb || addr.neighbourhood || addr.road || '';
      const pincode = addr.postcode || '';
      const state = addr.state || '';
      const fullAddress = data.display_name
        ? data.display_name.split(',').slice(0, 3).join(', ')
        : `${area ? area + ', ' : ''}${city}`;

      return {
        city,
        area,
        pincode,
        state,
        address: fullAddress || `${city}, ${state}`
      };
    }
  } catch {
    // Both reverse geocoders unavailable
  }

  return {
    city: '',
    area: '',
    pincode: '',
    state: '',
    address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
  };
}

/**
 * Detects location via IP Geolocation (Zero permissions required, works in iFrames & laptops)
 */
export async function detectIpLocation(): Promise<DetectedLocation> {
  // Method 1: ipwho.is
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.city) {
        return {
          latitude: data.latitude || 16.5062,
          longitude: data.longitude || 80.6480,
          city: data.city,
          area: data.city,
          state: data.region || '',
          pincode: data.postal || '',
          address: `${data.city}, ${data.region || ''}${data.country ? ', ' + data.country : ''}`,
          source: 'ip'
        };
      }
    }
  } catch {
    // Proceed to fallback
  }

  // Fallback: Default to Vijayawada Central Hub store location
  return {
    latitude: 16.5062,
    longitude: 80.6480,
    city: 'Vijayawada',
    area: 'Benz Circle / MG Road',
    state: 'Andhra Pradesh',
    pincode: '520010',
    address: 'Benz Circle, MG Road, Vijayawada, Andhra Pradesh 520010',
    source: 'manual'
  };
}

/**
 * Robust Multi-Tier Location Detection:
 * 1. Tries Browser GPS (with low-accuracy wifi/cell mode for fast laptop response)
 * 2. Reverse-geocodes coordinates to exact city, area, pincode
 * 3. If GPS is denied, timed out, or restricted by iFrame: seamlessly detects via IP Geolocation
 * 4. Ensures a valid location is ALWAYS returned so the customer is never stuck
 */
export async function detectCurrentLocation(): Promise<DetectedLocation> {
  // Step 1: Check if browser geolocation is available
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const coords = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            });
          },
          (err) => {
            reject(err);
          },
          {
            enableHighAccuracy: false, // Essential: allows WiFi/cell tower fix on laptops without hardware GPS
            timeout: 5000,
            maximumAge: 300000 // Accept position up to 5 minutes old for instant response
          }
        );
      });

      // Step 2: Reverse Geocode coordinates to address
      const geo = await reverseGeocode(coords.latitude, coords.longitude);

      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        city: geo.city || 'Vijayawada',
        area: geo.area || '',
        state: geo.state || 'Andhra Pradesh',
        pincode: geo.pincode || '',
        address: geo.address || `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`,
        source: 'gps'
      };
    } catch {
      // Browser GPS denied, blocked by iframe permissions policy, or timed out.
      // Seamlessly fall back to IP Geolocation!
    }
  }

  // Step 3: IP Geolocation Fallback
  return await detectIpLocation();
}
