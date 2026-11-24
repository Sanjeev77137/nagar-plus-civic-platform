import { useCallback, useEffect, useRef, useState } from 'react';

export interface GeoComponents {
  state: string | null;
  district: string | null;
  city: string | null;
  postcode: string | null;
  displayName: string | null;
}

export interface GpsState {
  tracking: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: string | null;
  components: GeoComponents | null;
  capturedAt: number | null;
}

interface NominatimAddress {
  state?: string;
  state_district?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  hamlet?: string;
  municipality?: string;
  postcode?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

function toComponents(data: NominatimResponse): GeoComponents {
  const a = data.address ?? {};
  return {
    state: a.state ?? null,
    district: a.county ?? a.state_district ?? null,
    city: a.city ?? a.town ?? a.village ?? a.suburb ?? a.municipality ?? a.hamlet ?? null,
    postcode: a.postcode ?? null,
    displayName: data.display_name ?? null,
  };
}

export function useGpsTracker() {
  const [gps, setGps] = useState<GpsState>({
    tracking: false,
    error: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    address: null,
    components: null,
    capturedAt: null,
  });
  const watchIdRef = useRef<number | null>(null);
  const lastGeocodeRef = useRef<{ lat: number; lon: number } | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    const last = lastGeocodeRef.current;
    if (last && Math.abs(last.lat - lat) < 0.0005 && Math.abs(last.lon - lon) < 0.0005) return;
    lastGeocodeRef.current = { lat, lon };
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) return;
      const data: NominatimResponse = await res.json();
      setGps((g) => ({ ...g, address: data.display_name ?? g.address, components: toComponents(data) }));
    } catch {
      // reverse geocoding is best-effort; coordinates still remain usable
    }
  }, []);

  const applyPosition = useCallback(
    (pos: GeolocationPosition, timestamped: boolean) => {
      const { latitude, longitude, accuracy } = pos.coords;
      setGps((g) => ({
        ...g,
        latitude,
        longitude,
        accuracy,
        error: null,
        capturedAt: timestamped ? Date.now() : g.capturedAt ?? Date.now(),
      }));
      reverseGeocode(latitude, longitude);
    },
    [reverseGeocode]
  );

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGps((g) => ({ ...g, error: 'Geolocation is not supported by this browser.' }));
      return;
    }
    if (watchIdRef.current !== null) return;
    setGps((g) => ({ ...g, tracking: true, error: null }));
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        applyPosition(pos, false);
        setGps((g) => ({ ...g, tracking: true }));
      },
      (err) => {
        setGps((g) => ({
          ...g,
          tracking: false,
          error:
            err.code === err.PERMISSION_DENIED
              ? 'Location permission denied. Allow location access in your browser settings.'
              : 'Unable to get your location. Please try again.',
        }));
        watchIdRef.current = null;
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }, [applyPosition]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGps((g) => ({ ...g, tracking: false }));
  }, []);

  const captureOnce = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => applyPosition(pos, true),
      () => {
        // silent background capture: photo upload continues even without location
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [applyPosition]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { gps, startTracking, stopTracking, captureOnce };
}

export function googleMapsLink(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}
