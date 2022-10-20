import React, {useState, useRef, useEffect, useCallback} from 'react';
import {createMap} from '@unfolded/map-sdk';

import './App.scss';

function App() {
  const [map, setMap] = useState(null);
  const [layers, setLayers] = useState([]);
  const [layerResult, setLayerResult] = useState('');

  const [_deckProps, setDeckProps] = useState({});
  const [deckLib, setDeckLib] = useState(undefined);

  useEffect(() => {
    const loadData = async () => {
      const locationData = await (await fetch("/data/cities.json")).json();

      const dataset = {
        id: 'test-dataset-01',
        label: 'Cities',
        color: [194, 29, 29],
        data: locationData
      };
  
      map && map.addDataset(dataset);
    }
    loadData();
  }, [map]);

  const onDeckLoad = useCallback(({deck}) => {
    console.log("onDeckLoad", {deck});
    setDeckLib(deck)
  }, [])
  
  const onDeckRender = useCallback((
    deckProps,
    { deck, layersRenderData, layerTimeline, mapIndex }
  ) => {
    console.log("onDeckRender", deckProps)
    setDeckProps(deckProps)
    return deckProps;
  }, [])

  console.log("_deckProps", _deckProps)
  console.log("deckLib", deckLib)

  const loadLayers = () => {
    const layers = map.getLayers();
    setLayerResult(JSON.stringify(layers, null, 2));
    setLayers(layers);
  };

  const setLayerVisibilityForId = id => {
    const index = layers.findIndex(layer => layer.id === id),
      layer = layers[index],
      layerId = layer.id,
      isVisible = !layer.isVisible;
    layers[index] = map.updateLayer(layerId, {isVisible});
    const newLayers = [...layers];
    setLayers(newLayers);
  };

  const goTo = location => {
    let viewStateConfig = {
      longitude: 0,
      latitude: 0,
      zoom: 0
    };
    switch (location) {
      case 'sf':
        viewStateConfig = {
          longitude: -122.4194,
          latitude: 37.7749,
          zoom: 6
        };
        break;
      case 'la':
        viewStateConfig = {
          longitude: -118.243683,
          latitude: 34.052235,
          zoom: 6
        };
        break;
      case 'ny':
        viewStateConfig = {
          longitude: -73.935242,
          latitude: 40.73061,
          zoom: 6
        };
        break;
      case 'london':
        viewStateConfig = {
          longitude: 0.1276,
          latitude: 51.5072,
          zoom: 6
        };
        break;
      default:
        break;
    }
    _setViewState(viewStateConfig);
  };

  const _setViewState = config => {
    map.setView(config);
  };

  return (
    <div className="App">
      <UnfoldedMap setMap={setMap} onDeckRender={onDeckRender} onDeckLoad={onDeckLoad} />
      <div className="sidemenu">
        {!map ? (
          <div id="loader" />
        ) : (
          <div id="content">
            <div className="content-section">
              <span className="section-label">Viewport controls</span>
              <div className="location-container">
                <button id="move_button_sf" onClick={() => goTo('sf')}>
                  San Francisco
                </button>
                <button id="move_button_ny" onClick={() => goTo('ny')}>
                  New York
                </button>
                <button id="move_button_la" onClick={() => goTo('la')}>
                  Los Angeles
                </button>
                <button id="move_button_london" onClick={() => goTo('london')}>
                  London
                </button>
              </div>
            </div>
            <div className="content-section">
              <span className="section-label">Layer controls</span>
              <button id="get-layers" onClick={() => loadLayers()}>
                GET LAYERS
              </button>
              <div id="layers-container">
                {layers.map((layer, index) => (
                  <div
                    key={index}
                    className={`layer ${layer.isVisible ? 'selected' : ''}`}
                    onClick={() => setLayerVisibilityForId(layer.id)}
                  >
                    <div className="layer-preview">
                      <img src="/images/layer-icon.svg" alt="layer-icon" />
                    </div>
                    <div className="layer-description">
                      <span className="layer-name">{layer.label}</span>
                      <span className="layer-text">Click to toggle layer visibility</span>
                    </div>
                  </div>
                ))}
              </div>
              <details open>
                <summary>JSON response</summary>
                <pre id="results">{layerResult}</pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UnfoldedMap({setMap, onDeckLoad, onDeckRender}) {
  const mountContainerRef = useRef(null);

  useEffect(() => {
    const loadMap = async () => {
      const mapInstance = await createMap({
        eventHandlers: {
          _onDeckLoad: onDeckLoad,
          _onDeckRender: onDeckRender,
        }
      });

      setMap(mapInstance);
      console.log(mapInstance)
      mapInstance.addToDOM(mountContainerRef?.current);
    };
    loadMap();
  }, [setMap, onDeckLoad, onDeckRender]);

  return (
    <div className="unfolded">
      <div ref={mountContainerRef} />
    </div>
  );
}

export default App;
