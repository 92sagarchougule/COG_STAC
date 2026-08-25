import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

import "leaflet/dist/leaflet.css";
import "./Map.css";

// STAC Item for the DEM COG uploaded to S3 (see DEMDoc/README.md for the
// full catalog layout: catalog.json -> collection.json -> this item).
const STAC_ITEM_URL =
  "https://cog-learning.s3.eu-north-1.amazonaws.com/stac/dem-collection/dem_cog/dem_cog.json";

const FALLBACK_CENTER = [16.94, 75.23];

// Elevation ramp between the raster's own min/max, matching the original demo.
function elevationColor(value, min, max) {
  const t = (value - min) / (max - min);
  const r = Math.round(30 + t * 200);
  const g = Math.round(120 + t * 80);
  const b = Math.round(60 - t * 40);
  return `rgb(${r},${g},${b})`;
}

function DemCogLayer({ stacItemUrl, onStatusChange }) {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    let layer;

    fetch(stacItemUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not fetch STAC item (${res.status})`);
        return res.json();
      })
      .then((item) => {
        const cogUrl = item.assets.data.href;
        // georaster doesn't compute min/max itself when reading a remote COG
        // (that would mean downloading the whole file) so pull the range from
        // the STAC item's raster extension stats instead.
        const bandStats = item.assets.data["raster:bands"]?.[0]?.statistics;

        return parseGeoraster(cogUrl).then((georaster) => {
          if (cancelled) return;

          const min = bandStats?.minimum ?? georaster.mins?.[0];
          const max = bandStats?.maximum ?? georaster.maxs?.[0];

          layer = new GeoRasterLayer({
            georaster,
            opacity: 0.85,
            resolution: 256,
            pixelValuesToColorFn: (values) => {
              const v = values[0];
              if (v === null || v === undefined || v === georaster.noDataValue) {
                return null;
              }
              return elevationColor(v, min, max);
            },
          });
          layer.addTo(map);
          map.fitBounds(layer.getBounds());

          const epsg = item.properties["proj:code"] || item.properties["proj:epsg"];
          onStatusChange({
            text: `${item.id} | EPSG:${epsg} | ${georaster.width}x${georaster.height} px`,
            min,
            max,
          });
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        onStatusChange({ text: `Error: ${err.message}` });
        map.setView(FALLBACK_CENTER, 11);
      });

    return () => {
      cancelled = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map, stacItemUrl, onStatusChange]);

  return null;
}

export default function LeafletMap() {
  const [status, setStatus] = useState({ text: "Loading STAC item & COG..." });

  return (
    <div className="map-container" style={{ position: "relative" }}>
      <MapContainer
        center={FALLBACK_CENTER}
        zoom={11}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <DemCogLayer stacItemUrl={STAC_ITEM_URL} onStatusChange={setStatus} />
      </MapContainer>

      <div
        style={{
          position: "absolute",
          top: 10,
          left: 50,
          zIndex: 1000,
          background: "white",
          padding: "6px 10px",
          borderRadius: 6,
          fontFamily: "sans-serif",
          fontSize: 13,
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        {status.text}
      </div>

      {status.min !== undefined && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 10,
            zIndex: 1000,
            background: "white",
            padding: "8px 12px",
            borderRadius: 6,
            fontFamily: "sans-serif",
            fontSize: 13,
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          <b>Elevation (m)</b>
          <br />
          min: {status.min.toFixed(1)}
          <br />
          max: {status.max.toFixed(1)}
        </div>
      )}
    </div>
  );
}
