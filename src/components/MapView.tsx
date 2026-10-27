import React, { useEffect, useRef, useState } from 'react';
import { Star, X, ChevronRight } from 'lucide-react';
import { Listing } from '../types/index.ts';
import { formatINR } from '../utils/formatCurrency.ts';

interface MapViewProps {
  listings: Listing[];
  selectedListingId: string | null;
  onSelectListing: (listing: Listing) => void;
  center?: [number, number];
  zoom?: number;
}

const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY is not set. Google Maps will not load.');
      reject(new Error('Missing Google Maps API key'));
      return;
    }

    if (window.google?.maps) {
      resolve();
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
      return;
    }

    if (script.dataset.loaded === 'true') {
      resolve();
      return;
    }

    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')), { once: true });
  });
};

export const MapView: React.FC<MapViewProps> = ({
  listings,
  selectedListingId,
  onSelectListing,
  center = [21.7679, 78.8718],
  zoom = 5
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Array<any>>([]);
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    loadGoogleMaps()
      .then(() => {
        if (!isMounted || !mapContainerRef.current || !window.google?.maps) return;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: center[0], lng: center[1] },
            zoom,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });
        }

        const map = mapInstanceRef.current;

        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        const bounds = new window.google.maps.LatLngBounds();

        listings.forEach(listing => {
          const { lat, lng } = listing.location;
          bounds.extend({ lat, lng });

          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: listing.title,
            icon: {
              path: 'M 0,0 L 22,0 L 22,18 L 11,32 L 0,18 Z',
              fillColor: selectedListingId === listing.id ? '#ef4444' : '#111827',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 1,
              labelOrigin: new window.google.maps.Point(11, 9)
            },
            label: {
              text: formatINR(listing.price),
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700'
            }
          });

          marker.addListener('click', () => {
            setActiveListing(listing);
            map.panTo({ lat, lng });
          });

          markersRef.current.push(marker);
        });

        if (listings.length > 0 && !selectedListingId) {
          map.fitBounds(bounds, { left: 60, top: 60, right: 60, bottom: 60 });
        }
      })
      .catch(() => {
        if (isMounted) {
          setActiveListing(null);
        }
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, [listings, selectedListingId, center, zoom]);

  useEffect(() => {
    if (selectedListingId && mapInstanceRef.current) {
      const target = listings.find(l => l.id === selectedListingId);
      if (target) {
        setActiveListing(target);
        mapInstanceRef.current.panTo({ lat: target.location.lat, lng: target.location.lng });
        mapInstanceRef.current.setZoom(12);
      }
    }
  }, [selectedListingId, listings]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-neutral-200">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Active Listing Card */}
      {activeListing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => setActiveListing(null)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-neutral-700 shadow-sm z-30 transition-transform active:scale-95"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>

          <div
            onClick={() => onSelectListing(activeListing)}
            className="cursor-pointer group"
          >
            <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
              <img
                src={activeListing.images[0]}
                alt={activeListing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-xs font-semibold">
                {activeListing.propertyType}
              </div>
            </div>

            <div className="p-3.5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800 truncate">
                  {activeListing.location.city}, {activeListing.location.country}
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold tabular-nums text-neutral-900">
                  <Star className="w-3.5 h-3.5 fill-neutral-900 text-neutral-900" />
                  <span>{activeListing.rating.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 line-clamp-1">
                {activeListing.title}
              </p>

              <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold tabular-nums text-neutral-900">
                    {formatINR(activeListing.price)}
                  </span>
                  <span className="text-xs text-neutral-500">night</span>
                </div>

                <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5 group-hover:underline">
                  View stay <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
