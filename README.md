Here is a comprehensive, production-ready `README.md` file designed for your GitHub repository. It clearly explains the architecture, business value, and workflow of cataloging S3-hosted COG DEMs using STAC and serving them to a Leaflet frontend—without cluttering the main read with code blocks.

---

# STAC-Driven COG DEM Visualization System

An enterprise-grade geospatial web architecture that catalog-indexes Cloud Optimized GeoTIFF (COG) Digital Elevation Models (DEMs) stored in Amazon S3 using the SpatioTemporal Asset Catalog (STAC) specification, enabling efficient streaming and interactive visualization on a Leaflet map.

---

## 🌟 Overview

Traditional Digital Elevation Model (DEM) workflows require downloading massive GeoTIFF files or running complex tile-server infrastructure. This project eliminates both bottlenecks by combining **Cloud Optimized GeoTIFFs (COGs)**, **STAC metadata standards**, and **modern web-mapping client capabilities**.

By storing standardized STAC JSON metadata alongside S3-hosted DEMs, frontend clients can query spatial bounding boxes, inspect elevation properties, and stream only the exact pixel chunks required for the current map view using HTTP Range Requests.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             AWS S3 BUCKET                               │
│  ┌──────────────────────────────┐     ┌──────────────────────────────┐  │
│  │     Cloud Optimized GeoTIFF  │     │       STAC Metadata          │  │
│  │         (dem_zone1.tif)      │     │      (dem_zone1.json)        │  │
│  └──────────────┬───────────────┘     └──────────────┬───────────────┘  │
└─────────────────┼────────────────────────────────────┼──────────────────┘
                  │                                    │
                  │ Byte-Range Requests                │ Metadata Fetch
                  ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            LEAFLET APP                                  │
│  ┌──────────────────────────────┐     ┌──────────────────────────────┐  │
│  │   Client-Side COG Parser    │     │   Elevation Color Engine     │  │
│  │   (Reads Raw Band Values)    │ ──► │  (Dynamic Terrain Heatmap)   │  │
│  └──────────────────────────────┘     └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

```

---

## Key Features

* **Zero-Backend Architecture**: Decouples data storage from client rendering without requiring dedicated tile servers.
* **STAC Specification Compliance**: Uses standardized metadata items (`bbox`, `geometry`, `proj`, and `assets`) for cloud-native discoverability.
* **On-Demand Pixel Streaming**: Fetches only the required zoom and bounding-box chunks via HTTP Range requests.
* **Client-Side Color Mapping**: Dynamically applies custom terrain colormaps, elevation thresholds, and hillshading directly within Leaflet.
* **Scalable Data Cataloging**: Easily extends to hundreds of DEM tiles by publishing catalogs via STAC API frameworks (e.g., pgSTAC / STAC-FastAPI).

---

## 🚀 Technical Workflow

1. **Storage & Optimization**: Elevation rasters are converted to Cloud Optimized GeoTIFFs with internal overviews and uploaded to AWS S3.
2. **Metadata Cataloging**: A STAC Item JSON is generated per raster asset containing spatial extents, CRS projections, and asset endpoints.
3. **Frontend Discovery**: The Leaflet application fetches the STAC Item JSON to extract spatial boundaries and asset location URLs.
4. **Dynamic Layering**: The web app reads raw elevation values directly from S3 using GeoRaster, transforming pixel arrays into real-time visual terrain maps.

---

## 🔒 Security & Performance Requirements

* **S3 CORS Policies**: The target S3 bucket must have Cross-Origin Resource Sharing (CORS) enabled allowing `GET` and `HEAD` methods, with `Content-Range` exposed in headers.
* **Asset Accessibility**: Public read access or pre-signed URLs are required for client-side raster fetching.
* **PySTAC Automation**: Catalog generation scripts can be integrated into CI/CD pipelines or AWS Lambda functions to automatically catalog new COG uploads.

---

## 📂 Repository Structure

* **`stac/`**: Contains static STAC Catalogs, Collections, and Item JSON records.
* **`src/`**: Web application source code housing Leaflet maps, controls, and rendering layers.
* **`scripts/`**: Automation tools for COG validation and PySTAC catalog generation.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
