import { DetectedLocation } from '../types';

export async function detectCurrentLocation(): Promise<DetectedLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser. Please enter your address manually.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

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
            const road = addr.road ? `${addr.road}, ` : '';
            const fullAddress = data.display_name
              ? data.display_name.split(',').slice(0, 3).join(', ')
              : `${road}${area}${area ? ', ' : ''}${city}`;

            resolve({
              latitude,
              longitude,
              city,
              area,
              address: fullAddress,
              pincode,
              state: addr.state || ''
            });
            return;
          }
        } catch {
          // If reverse geocoding API network times out, return raw coords
        }

        resolve({
          latitude,
          longitude,
          city: '',
          area: '',
          address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
          pincode: '',
          state: ''
        });
      },
      (err) => {
        // Never invent a fake location!
        reject(new Error(err.message || 'Location permission was denied or unavailable. Please enter your address manually.'));
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  });
}
