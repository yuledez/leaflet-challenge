// Create the map object with options
let myMap = L.map("map", {
  center: [37.7749, -122.4194],
  zoom: 4
}); 

// tile layer  to map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Define a function to set the marker size based on earthquake magnitude
function markerSize(magnitude) {
  return magnitude * 50; 
}

function createFeatures(earthquakeData) {

  // popups to each marker
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
  }
}
// Define a function to set the marker color based on earthquake depth
function markerColor(depth) {
  if (depth > 90) return "#FF5F65";
  else if (depth > 70) return "#FCA35D";
  else if (depth > 50) return "#FDB72A";
  else if (depth > 30) return "#F7DB11";
  else if (depth > 10) return "#DCFFA3";
  else return "#A3F600";
}

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(infoRes) {

  // GeoJSON layer with the features array on the earthquakeData object
  L.geoJson(infoRes, {
    // circle marker for each feature
    pointToLayer: function(feature, latlng) {
      return L.circle(latlng, {
        radius: markerSize(feature.properties.mag)* 500,
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
  }).addTo(myMap);

  // legend control
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
  // info legend
  let div = L.DomUtil.create("div", "info legend");

  // depth intervals and corresponding colors
  let depths = [-10, 10, 30, 50, 70, 90];
  let colors = depths.map(d => markerColor(d + 1));

  // title for the legend
  let title = L.DomUtil.create("h4", "legend-title");
  title.innerText = "Earthquake Depth (km)";
  div.appendChild(title);

  // legend items for each depth interval
  for (let i = 0; i < depths.length; i++) {
    // ontainer for each legend item
    let item = L.DomUtil.create("div", "legend-item");

    // colored box for the depth interval
    let colorBox = L.DomUtil.create("span", "legend-color");
    colorBox.style.backgroundColor = colors[i];
    item.appendChild(colorBox);

    // label for the depth interval
    let label = L.DomUtil.create("span", "legend-label");
    label.innerText = depths[i] + (depths[i + 1] ? '–' + depths[i + 1] : '+');
    item.appendChild(label);

    // Append the legend item to the legend container
    div.appendChild(item);
  }

  return div;
};

// Adding legend to the map
legend.addTo(myMap);
});