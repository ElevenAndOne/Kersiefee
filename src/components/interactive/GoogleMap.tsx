import { useEffect, useRef, useState } from "react";

const VENUE_ADDRESS = "Ceres Sportsgrounds, Phillip St, Ceres, 6835, South Africa";

/** Fallback centre if geocoding is unavailable (Ceres town centre). */
const FALLBACK_CENTER = { lat: -33.3689, lng: 19.3111 };

/** Google Maps style tuned to the Kersiefees palette. */
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#fdeef2" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#b61f2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#ec9ab0" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#fbe2e9" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  // parks/reserves: tint of the site's Light Green token (#96c639)
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d5e8b0" }] },
  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#f6d9e0" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f8c9d6" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#c94f63" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#f3b8c8" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#b61f2e" }] },
];

declare global {
  interface Window {
    __kersieMapsReady?: Promise<void>;
    __kersieMapsInit?: () => void;
  }
}

function loadMapsApi(key: string): Promise<void> {
  if (!window.__kersieMapsReady) {
    window.__kersieMapsReady = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=__kersieMapsInit`;
      script.async = true;
      window.__kersieMapsInit = () => resolve();
      script.onerror = () => reject(new Error("Google Maps failed to load"));
      document.head.appendChild(script);
    });
  }
  return window.__kersieMapsReady;
}

/** Resolve the venue address to coordinates; falls back to the town centre. */
async function locateVenue(): Promise<google.maps.LatLng | google.maps.LatLngLiteral> {
  try {
    const { results } = await new google.maps.Geocoder().geocode({ address: VENUE_ADDRESS });
    return results[0]?.geometry.location ?? FALLBACK_CENTER;
  } catch {
    return FALLBACK_CENTER;
  }
}

interface GoogleMapProps {
  /** Google Maps JS API key; without one the static fallback image is shown. */
  apiKey?: string;
  fallbackSrc: string;
  fallbackAlt: string;
}

/**
 * Live Google Map styled to the site palette, with a static-image fallback
 * when no API key is configured or the API fails to load.
 */
export default function GoogleMap({ apiKey, fallbackSrc, fallbackAlt }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;
    let cancelled = false;

    loadMapsApi(apiKey)
      .then(async () => {
        if (cancelled || !mapRef.current) return;
        const position = await locateVenue();
        if (cancelled || !mapRef.current) return;
        const map = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: 11,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: false,
          keyboardShortcuts: false,
          gestureHandling: "cooperative",
        });
        new google.maps.Marker({
          map,
          position,
          title: "Ceres Sportsgrounds, Phillip St, Ceres – Ceres Kersiefees",
        });
        setReady(true);
      })
      .catch(() => setReady(false));

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  return (
    <div className="themed-map relative aspect-810/525 w-full overflow-hidden rounded-blob bg-blossom">
      <img
        src={fallbackSrc}
        alt={fallbackAlt}
        loading="lazy"
        className={"absolute inset-0 size-full object-cover transition-opacity duration-500 "
          + (ready ? "pointer-events-none opacity-0" : "opacity-100")}
      />
      <div
        ref={mapRef}
        className={"absolute inset-0 " + (ready ? "" : "invisible")}
        aria-label="Interaktiewe kaart – Ceres Sportsgrounds, Phillip Straat, Ceres"
      />
    </div>
  );
}
