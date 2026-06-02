"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, LocateFixed, Loader2, AlertTriangle, ExternalLink } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Emplacement du bureau KARHON Assurances
// Cocody – Angré 8ème Tranche, Abidjan (BP V 236).
// ⚠️ Coordonnées APPROXIMATIVES : ajuste lat/lng ci-dessous avec
// les coordonnées exactes (clic droit sur Google Maps → copier).
// ─────────────────────────────────────────────────────────────
const OFFICE = {
  lat: 5.3960,
  lng: -3.9850,
  label: "KARHON Assurances",
  adresse: "Cocody, Angré 8ème Tranche — BP V 236 Abidjan",
};

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// Charge le script Google Maps une seule fois (avec la librairie routes).
let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise<void>((resolve, reject) => {
    if (!GOOGLE_MAPS_KEY) {
      reject(new Error("missing-key"));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("script-error"));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

type Statut = "init" | "ok" | "no-key" | "error" | "denied";

export default function MapItineraire() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const officeMarkerRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const userPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const [statut, setStatut] = useState<Statut>("init");
  const [hasPosition, setHasPosition] = useState(false);
  const [route, setRoute] = useState<{ distance: string; duree: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Initialisation de la carte + suivi de position en temps réel.
  useEffect(() => {
    let annule = false;

    loadGoogleMaps()
      .then(() => {
        if (annule || !mapDivRef.current) return;
        const g = (window as any).google;

        const map = new g.maps.Map(mapDivRef.current, {
          center: OFFICE,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        mapRef.current = map;

        officeMarkerRef.current = new g.maps.Marker({
          position: OFFICE,
          map,
          title: OFFICE.label,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#1a2e5a",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });
        const info = new g.maps.InfoWindow({
          content: `<div style="font-weight:600;color:#1a2e5a">${OFFICE.label}</div><div style="font-size:12px;color:#555">${OFFICE.adresse}</div>`,
        });
        officeMarkerRef.current.addListener("click", () => info.open(map, officeMarkerRef.current));

        directionsRendererRef.current = new g.maps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: { strokeColor: "#2a8a8a", strokeWeight: 5 },
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatut("ok");

        // Suivi de la position en temps réel.
        if ("geolocation" in navigator) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              userPosRef.current = p;
              setHasPosition(true);

              if (!userMarkerRef.current) {
                userMarkerRef.current = new g.maps.Marker({
                  position: p,
                  map,
                  title: "Ma position",
                  icon: {
                    path: g.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#2a8a8a",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 3,
                  },
                });
              } else {
                userMarkerRef.current.setPosition(p);
              }
            },
            (err) => {
              if (err.code === err.PERMISSION_DENIED) setStatut("denied");
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
          );
        }
      })
      .catch((e: Error) => {
        if (annule) return;
        setStatut(e.message === "missing-key" ? "no-key" : "error");
      });

    return () => {
      annule = true;
      if (watchIdRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Calcule et trace l'itinéraire depuis la position actuelle jusqu'au bureau.
  const calculerItineraire = () => {
    const g = (window as any).google;
    const origin = userPosRef.current;
    if (!g || !origin) return;

    setLoadingRoute(true);
    const service = new g.maps.DirectionsService();
    service.route(
      {
        origin,
        destination: OFFICE,
        travelMode: g.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        setLoadingRoute(false);
        if (status === "OK" && result) {
          directionsRendererRef.current?.setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          if (leg) {
            setRoute({ distance: leg.distance?.text ?? "", duree: leg.duration?.text ?? "" });
          }
        } else {
          setRoute(null);
        }
      }
    );
  };

  // Ouvre l'itinéraire dans l'application Google Maps (nouvel onglet / app mobile).
  const ouvrirDansGoogleMaps = () => {
    const dest = `${OFFICE.lat},${OFFICE.lng}`;
    const origin = userPosRef.current;
    const params = new URLSearchParams({ api: "1", destination: dest, travelmode: "driving" });
    if (origin) params.set("origin", `${origin.lat},${origin.lng}`);
    window.open(`https://www.google.com/maps/dir/?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
      <div className="p-6 sm:p-8 pb-4">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: "#1a2e5a" }}>
          <MapPin style={{ color: "#2a8a8a" }} size={24} />
          Nous trouver
        </h2>
        <p className="text-gray-500 text-sm">{OFFICE.adresse}</p>
      </div>

      {/* Carte */}
      <div className="relative">
        <div ref={mapDivRef} className="w-full h-[360px] sm:h-[420px] bg-gray-100" />

        {/* Surcouches d'état */}
        {statut !== "ok" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gray-50">
            {statut === "init" && (
              <>
                <Loader2 className="animate-spin mb-3" size={28} style={{ color: "#2a8a8a" }} />
                <p className="text-gray-500 text-sm">Chargement de la carte…</p>
              </>
            )}
            {statut === "no-key" && (
              <>
                <AlertTriangle className="mb-3" size={28} style={{ color: "#d97706" }} />
                <p className="text-gray-600 text-sm max-w-sm">
                  Clé Google Maps manquante. Ajoute <code className="px-1 rounded bg-gray-200">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> dans <code className="px-1 rounded bg-gray-200">.env.local</code> puis redémarre le serveur.
                </p>
              </>
            )}
            {statut === "error" && (
              <>
                <AlertTriangle className="mb-3" size={28} style={{ color: "#dc2626" }} />
                <p className="text-gray-600 text-sm">Impossible de charger Google Maps. Vérifie la clé API et les API activées.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Barre d'action itinéraire */}
      <div className="p-6 sm:p-8 pt-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={calculerItineraire}
            disabled={statut !== "ok" || !hasPosition || loadingRoute}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
          >
            {loadingRoute ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
            Calculer l&apos;itinéraire
          </button>

          <button
            type="button"
            onClick={ouvrirDansGoogleMaps}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95 border"
            style={{ color: "#1a2e5a", borderColor: "#cfe3e3", backgroundColor: "#f5fbfb" }}
          >
            <ExternalLink size={18} style={{ color: "#2a8a8a" }} />
            Ouvrir dans Google Maps
          </button>
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-2">
          {statut === "denied" ? (
            <span className="flex items-center gap-2" style={{ color: "#dc2626" }}>
              <AlertTriangle size={16} /> Localisation refusée — autorise-la dans le navigateur.
            </span>
          ) : !hasPosition ? (
            <span className="flex items-center gap-2">
              <LocateFixed size={16} style={{ color: "#2a8a8a" }} /> Recherche de votre position…
            </span>
          ) : route ? (
            <span className="flex items-center gap-2" style={{ color: "#1a2e5a" }}>
              <Navigation size={16} style={{ color: "#2a8a8a" }} />
              <strong>{route.distance}</strong> · environ <strong>{route.duree}</strong> en voiture
            </span>
          ) : (
            <span className="flex items-center gap-2" style={{ color: "#2a8a8a" }}>
              <LocateFixed size={16} /> Position détectée — prêt à calculer l&apos;itinéraire.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
