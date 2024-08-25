// URLs for the tectonic plates data and earthquake data
let platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Load the tectonic plates data
d3.json(platesURL).then(function(platesData) {
    d3.json(earthquakeURL).then(function(earthquakeData) {

        // Create the different base maps
        let satelliteMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            id: "mapbox/standard-satellite",
            tileSize: 512,
            zoomOffset: -1,
            attribution: "© OpenStreetMap contributors"
        });

        
        // Create baseMaps object to hold the base layers
        let baseMaps = {
            "Satellite": satelliteMap,
            //"Grayscale": grayscaleMap,
            //"Outdoors": outdoorsMap
        };

        // Create layer groups for earthquakes and tectonic plates
        let earthquakes = new L.LayerGroup();
        let tectonicPlates = new L.LayerGroup();

        // Create the map object
        let myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 3,
            layers: [satelliteMap, earthquakes, tectonicPlates]
        });

        // Add the earthquakes data as circle markers
        L.geoJson(earthquakeData, {
            pointToLayer: function(feature, latlng) {
                return L.circle(latlng, {
                    radius: markerSize(feature.properties.mag) * 30000,
                    fillColor: markerColor(feature.geometry.coordinates[2]),
                    color: "#000",
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function(feature, layer) {
              layer.bindPopup(
                  `<h3>${feature.properties.place}</h3>
                  <hr>
                  <p>Date: ${new Date(feature.properties.time)}</p>
                  <p>Magnitude: ${feature.properties.mag}</p>
                  <p>Depth: ${feature.geometry.coordinates[2]} km</p>`
              );
          }
        }).addTo(earthquakes);

        // Add the tectonic plates data
        L.geoJson(platesData, {
            style: function(feature) {
                return {
                    color: "orange",
                    weight: 2
                };
            }
        }).addTo(tectonicPlates);

        // Create an overlay object to hold our overlay layers
        let overlayMaps = {
            "Earthquakes": earthquakes,
            "Tectonic Plates": tectonicPlates
        };

        // Add layer control to the map
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);

        // Add the earthquake layer to the map by default
        earthquakes.addTo(myMap);
        tectonicPlates.addTo(myMap);

        // Add the legend to the map
        let legend = L.control({ position: "bottomright" });

        legend.onAdd = function() {
            let div = L.DomUtil.create("div", "info legend"),
                depths = [-10, 10, 30, 50, 70, 90],
                labels = [];

            for (let i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + markerColor(depths[i] + 1) + '"></i> ' +
                    depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(myMap);

    });
});

// Function to determine circle size based on earthquake magnitude
function markerSize(magnitude) {
    return magnitude * 2; // Adjust this to make circles larger or smaller
}

// Function to determine marker color based on earthquake depth
function markerColor(depth) {
    if (depth > 90) return "#FF5F65";
    else if (depth > 70) return "#FCA35D";
    else if (depth > 50) return "#FDB72A";
    else if (depth > 30) return "#F7DB11";
    else if (depth > 10) return "#DCFFA3";
    else return "#A3F600";
}