import ReactDOM from 'react-dom';
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './App.css';
import Data from './kabupaten.geojson';
import Download from './data-download.json';
import PopupContent from './popup.js';
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFuc2FsYmEiLCJhIjoiY2t0NDMxMzlnMTAxNzJ2bW03bDFwM21vbyJ9.4jAdRHYVdOteOa1Y-9nYug';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(106.816666);
  const [lat, setLat] = useState(-6.200000);
  const [zoom, setZoom] = useState(6);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [lng, lat],
      zoom: zoom
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });
  

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('load', () => {
      map.current.addSource('my-data', {
        'type': 'geojson',
        'data': Data,
        'promoteId': 'KABUPATEN'
      });

      Download.forEach((item) =>{
        map.current.setFeatureState(
          {
            source: 'my-data',
            id: item.location
          },
          {
            averageDownload: item.avg_download_throughput
          }
        )
      })

      map.current.addLayer({
        'id': 'kabupaten',
        'type': 'fill',
        'source': 'my-data',
        'layout': {},
        'paint': {
          'fill-color': [
            'case',
            ['<=', ['feature-state', 'averageDownload'], 5000],
            '#FFEBEE',
            ['<=', ['feature-state', 'averageDownload'], 10000],
            '#FFCDD2',
            ['<=', ['feature-state', 'averageDownload'], 15000],
            '#EF5350',
            '#B71C1C'
          ],
          'fill-opacity': 0.8
        },
      })

      map.current.addLayer({
        'id': 'garis-pembatas',
        'type': 'line',
        'source': 'my-data',
        'paint': {
          'line-color': '#000000',
          'line-width': 2
        },
      })

      const layers = [
        'Tidak ada data',
        '0-5000',
        '5000-10.000',
        '10.000-15.000',
        '> 15.000',
      ];

        const colors = [
        '#000000',
        '#FFEBEE',
        '#FFCDD2',
        '#EF5350',
        '#B71C1C',
      ];

      const legend = document.getElementById('legend');
 
      layers.forEach((layer, i) => {
        const color = colors[i];
        const item = document.createElement('div');
        const key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = color;
         
        const value = document.createElement('span');
        value.innerHTML = `${layer}`;
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
      });

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      map.current.on('mouseenter', 'kabupaten', (e) => {
        if (e.features && e.features.length && map.current) {
          map.current.getCanvas().style.cursor = 'crosshair';
        }
      })
      map.current.on('mouseleave', 'kabupaten', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
        popup.remove();
      })
      map.current.on('mousemove', 'kabupaten', (e) => {
        if (e.features && e.features.length) {
          const { lat, lng } = e.lngLat;
          const feature = e.features[0];
          const popupNode = document.createElement('div');
          ReactDOM.render(<PopupContent id={feature.properties.ID_KAB} kabupaten={feature.properties.KABUPATEN} region={feature.properties.REGION} averagedownload={feature.state.averageDownload}/>, popupNode)
          if (map.current) {
            popup
              .setLngLat([lng, lat])
              .setDOMContent(popupNode)
              .addTo(map.current);
          }
        }
      });
    });
  });

  return (
    <div>
    <div ref={mapContainer} className="map-container" />
    <div class='map-overlay' id='legend'/>
  </div>
  );
}

export default App;
