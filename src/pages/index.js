import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import axios from 'axios'
import { useTracker } from 'hooks'
import { commafy, friendlyDate } from 'lib/util'

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';
import Snippet from 'components/Snippet';


const LOCATION = {
  lat: 38.9072,
  lng: -77.0369,
};

const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;

/**
 * MapEffect
 * @description This is an example of creating an effect used to zoom in and set a popup on load
 */

const IndexPage = () => {
  const { data: countries = [] } = useTracker({
    api: 'countries'
  })

  const { data: stats = [] } = useTracker({
    api: "all"
  })


  const hasCountries = Array.isArray(countries) && countries.length > 0

  const dashboardStats = [
    {
      primary: {
        label: 'Total Cases',
        value: stats?.cases
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats?.casesPerOneMillion
      }
    },
    {
      primary: {
        label: 'Total Deaths',
        value: stats?.deaths
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats?.deathsPerOneMillion
      }
    },
    {
      primary: {
        label: 'Total Tests',
        value: stats?.tests
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats?.testsPerOneMillion
      }
    },
    {
      primary: {
        label: "Critical Cases",
        value: stats?.critical
      },
      secondary: {
        label: "Per 1 Million",
        value: stats?.criticalPerOneMillion
      }
    },
    {
      primary: {
        label: "Active Cases",
        value: stats?.active
      },
      secondary: {
        label: "Per 1 Million",
        value: stats?.activePerOneMillion
      }
    },
    {
      primary: {
        label: "Recovered Cases",
        value: stats?.recovered
      },
      secondary: {
        label: "Per 1 Million",
        value: stats?.recoveredPerOneMillion
      }
    }
  ]

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
  };

  const MapEffect = () => {
    const map = useMap()

    useEffect(() => {

      const fetch = async () => {

        if (!hasCountries) return;

        const geoJson = {
          type: 'FeatureCollection',
          features: countries.map((country = {}) => {
            const { countryInfo = {} } = country;
            const { lat, long: lng } = countryInfo;
            return {
              type: 'Feature',
              properties: {
                ...country,
              },
              geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              }
            }
          })
        }

        const geoJsonLayers = new L.GeoJSON(geoJson, {
          pointToLayer: (feature = {}, latlng) => {
            const { properties = {} } = feature;
            let updatedFormatted;
            let casesString;

            const {
              country,
              updated,
              cases,
              deaths,
              recovered
            } = properties

            casesString = `${cases}`;

            if (cases > 1000000)
              casesString = `${Math.floor(casesString / 1000000)}m+`
            else if (cases > 1000) {
              casesString = `${casesString.slice(0, -3)}k+`
            }

            if (updated) {
              updatedFormatted = new Date(updated).toLocaleString();
            }

            const html = `
              <span class="icon-marker">
                <span class="icon-marker-tooltip">
                  <h2>${country}</h2>
                  <ul>
                    <li><strong>Confirmed:</strong> ${commafy(cases)}</li>
                    <li><strong>Deaths:</strong> ${commafy(deaths)}</li>
                    <li><strong>Recovered:</strong> ${commafy(recovered)}</li>
                    <li><strong>Last Update:</strong> ${updatedFormatted}</li>
                  </ul>
                </span>
                ${casesString}
              </span>
            `;

            return L.marker(latlng, {
              icon: L.divIcon({
                className: 'icon',
                html
              }),
              riseOnHover: true
            });
          }
        })

        geoJsonLayers.addTo(map)

      }

      fetch()
    }, []);

    return null;
  };

  console.log('TEST', commafy(73691855))

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <div className="tracker">
        <Map {...mapSettings}>
          <MapEffect />
        </Map>
        <div className="tracker-stats">
          <ul>
            {dashboardStats.map(({ primary = {}, secondary = {} }, i) => {
              return (
                <li key={`Stat-${i}`} className="tracker-stat">
                  { primary.value && (
                    <p className="tracker-stat-primary">
                      { commafy(primary.value)}
                      <strong>{primary.label}</strong>
                    </p>
                  )}
                  { secondary.value && (
                    <p className="tracker-stat-secondary">
                      { commafy(secondary.value)}
                      <strong>{secondary.label}</strong>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="tracker-last-updated">
          <p>
            Last Updated: { stats ? friendlyDate(stats?.updated) : "-" }
          </p>
        </div>

      </div>
    </Layout>
  );
};

export default IndexPage;
