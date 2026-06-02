"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, LocateFixed, Loader2, AlertTriangle, ExternalLink } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Carte KARHON Assurances — OpenStreetMap + Leaflet (100% gratuit)
//
// Aucune clé API, aucune carte bancaire requise.
//  • Fond de carte : OpenStreetMap (tuiles gratuites)
//  • Librairie     : Leaflet (chargée via CDN unpkg)
//  • Itinéraire    : OSRM (service de routage public gratuit)
//
// Emplacement du bureau — Cocody, Angré 8ème Tranche, Abidjan.
// ⚠️ Coordonnées APPROXIMATIVES : ajuste lat/lng ci-dessous avec
// les coordonnées exactes (clic droit sur Google Maps → copier).
// ─────────────────────────────────────────────────────────────
const OFFICE = {
  lat: 5.3960,
  lng: -3.9850,
  label: "KARHON Assurances",
  adresse: "Cocody, Angré 8ème Tranche — BP V 236 Abidjan",
};

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

// Charge Leaflet (CSS + JS) une seule fois.
let leafletPromise: Promise<void> | null = null;
function loadLeaflet(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).L) return Promise.resolve();
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise<void>((resolve, reject) => {
    // CSS
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    // JS
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("script-error"));
    document.head.appendChild(script);
  });
  return leafletPromise;
}

// Icône colorée simple (pastille) sans dépendre des images Leaflet par défaut.
function pastille(L: any, couleur: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${couleur};border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.2)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

type Statut = "init" | "ok" | "error" | "denied";

export default function MapItineraire() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const userPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const [statut, setStatut] = useState<Statut>("init");
  const [hasPosition, setHasPosition] = useState(false);
  const [route, setRoute] = useState<{ distance: string; duree: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Initialisation de la carte + suivi de position en temps réel.
  useEffect(() => {
    let annule = false;

    loadLeaflet()
      .then(() => {
        if (annule || !mapDivRef.current) return;
        const L = (window as any).L;

        const map = L.map(mapDivRef.current, {
          center: [OFFICE.lat, OFFICE.lng],
          zoom: 14,
          scrollWheelZoom: false,
        });
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);

        L.marker([OFFICE.lat, OFFICE.lng], { icon: pastille(L, "#1a2e5a") })
          .addTo(map)
          .bindPopup(
            `<div style="font-weight:600;color:#1a2e5a">${OFFICE.label}</div><div style="font-size:12px;color:#555">${OFFICE.adresse}</div>`
          );

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatut("ok");
        // Leaflet a parfois besoin d'un recalcul de taille après le rendu.
        setTimeout(() => map.invalidateSize(), 200);

        // Suivi de la position en temps réel.
        if ("geolocation" in navigator) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              userPosRef.current = p;
              setHasPosition(true);

              if (!userMarkerRef.current) {
                userMarkerRef.current = L.marker([p.lat, p.lng], { icon: pastille(L, "#2a8a8a") })
                  .addTo(map)
                  .bindPopup("Ma position");
              } else {
                userMarkerRef.current.setLatLng([p.lat, p.lng]);
              }
            },
            (err) => {
              if (err.code === err.PERMISSION_DENIED) setStatut("denied");
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
          );
        }
      })
      .catch(() => {
        if (!annule) setStatut("error");
      });

    return () => {
      annule = true;
      if (watchIdRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Calcule l'itinéraire (OSRM, gratuit) et le trace sur la carte.
  const calculerItineraire = async () => {
    const L = (window as any).L;
    const origin = userPosRef.current;
    const map = mapRef.current;
    if (!L || !origin || !map) return;

    setLoadingRoute(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${OFFICE.lng},${OFFICE.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const itin = data?.routes?.[0];

      if (itin) {
        // Supprime l'ancien tracé.
        if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);

        const coords = itin.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
        routeLayerRef.current = L.polyline(coords, { color: "#2a8a8a", weight: 5 }).addTo(map);
        map.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });

        const km = (itin.distance / 1000).toFixed(1);
        const min = Math.round(itin.duration / 60);
        setRoute({ distance: `${km} km`, duree: `${min} min` });
      } else {
        setRoute(null);
      }
    } catch {
      setRoute(null);
    } finally {
      setLoadingRoute(false);
    }
  };

  // Ouvre l'itinéraire dans Google Maps (nouvel onglet / app mobile).
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
        <div ref={mapDivRef} className="w-full h-[360px] sm:h-[420px] bg-gray-100 z-0" />

        {/* Surcouches d'état */}
        {statut !== "ok" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gray-50 z-[400]">
            {statut === "init" && (
              <>
                <Loader2 className="animate-spin mb-3" size={28} style={{ color: "#2a8a8a" }} />
                <p className="text-gray-500 text-sm">Chargement de la carte…</p>
              </>
            )}
            {statut === "error" && (
              <>
                <AlertTriangle className="mb-3" size={28} style={{ color: "#dc2626" }} />
                <p className="text-gray-600 text-sm">Impossible de charger la carte. Vérifie ta connexion Internet.</p>
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
