import { useEffect, useRef } from "react";
import esriConfig from "@arcgis/core/config";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer"; // <--- Import ImageryTileLayer
import Search from "@arcgis/core/widgets/Search";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import LayerList from "@arcgis/core/widgets/LayerList";
import Legend from "@arcgis/core/widgets/Legend";
import Expand from "@arcgis/core/widgets/Expand";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Home from "@arcgis/core/widgets/Home";

import "@arcgis/core/assets/esri/themes/light/main.css";
import "./Map.css";

export default function MapComponent() {
  const mapDivRef = useRef(null);

  useEffect(() => {
    esriConfig.apiKey = process.env.REACT_APP_ARCGIS_API_KEY || "";

    // 1. Define the Cloud Optimized GeoTIFF (COG) Layer
    const demCogLayer = new ImageryTileLayer({
      url: "https://cog-learning.s3.eu-north-1.amazonaws.com/dem_cog.tif",
      title: "DEM Raster (COG)",
      opacity: 0.8,
    });

    const trailheads = new FeatureLayer({
      url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Recreation/FeatureServer/0",
      outFields: ["*"],
      popupTemplate: {
        title: "{TRL_NAME}",
        content: "Trailhead: {CITY_JUR}, {PARK_NAME}",
      },
    });

    const trails = new FeatureLayer({
      url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Recreation/FeatureServer/1",
      opacity: 0.75,
      popupTemplate: {
        title: "{TRL_NAME}",
        content: "Length: {ELEV_GAIN} ft elevation gain",
      },
    });

    const parks = new FeatureLayer({
      url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Recreation/FeatureServer/2",
      opacity: 0.4,
      popupTemplate: {
        title: "{PARK_NAME}",
      },
    });

    // 2. Add demCogLayer to the WebMap's layers array
    const map = new WebMap({
      basemap: "topo-vector",
      layers: [demCogLayer, parks, trails, trailheads],
    });

    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [78, 18],
      zoom: 8,
      popup: {
        dockEnabled: true,
        dockOptions: {
          breakpoint: false,
          position: "top-right",
        },
      },
    });

    // 3. Zoom directly to the COG extent once loaded
    demCogLayer.when(() => {
      if (demCogLayer.fullExtent) {
        view.goTo(demCogLayer.fullExtent).catch(() => {});
      }
    });

    // Search widget
    const searchWidget = new Search({ view });
    view.ui.add(searchWidget, { position: "top-left", index: 0 });

    // Basemap gallery in an expandable panel
    const basemapGallery = new BasemapGallery({ view });
    const bgExpand = new Expand({
      view,
      content: basemapGallery,
      expandTooltip: "Basemaps",
    });
    view.ui.add(bgExpand, "top-right");

    // Layer list in an expandable panel
    const layerList = new LayerList({ view });
    const llExpand = new Expand({
      view,
      content: layerList,
      expandTooltip: "Layers",
    });
    view.ui.add(llExpand, "top-right");

    // Legend in an expandable panel
    const legend = new Legend({ view });
    const legendExpand = new Expand({
      view,
      content: legend,
      expandTooltip: "Legend",
    });
    view.ui.add(legendExpand, "bottom-right");

    // Home + scale bar
    view.ui.add(new Home({ view }), "top-left");
    view.ui.add(new ScaleBar({ view, unit: "dual" }), "bottom-left");

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  return <div className="map-container" ref={mapDivRef} />;
}