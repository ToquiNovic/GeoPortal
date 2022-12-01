//Map Attributes
var wfsAcamafrut = new L.featureGroup();
var wfsIGAC = new L.featureGroup();
var wfsjoin = new L.featureGroup();

// GeoServer Settings
var url_geoserver = "http://localhost:8081/geoserver/wms?";
var url_geoserver_wfs = "http://localhost:8081/geoserver/wfs?";

// Get WMS layers from GeoServer
var wmsIgac = new L.tileLayer.wms(url_geoserver, {
  layers: "Acamafrut:igac",
  format: "image/png8",
  transparent: true,
  tiled: true,
  opacity: 0.6,
  //cql_filter: "codigo_mun = '18592'",
  zIndex: 100,
  attribution: "Data from wms igac",
});

var wmsacamafrut = new L.tileLayer.wms(url_geoserver, {
  layers: "Acamafrut:acamafrut",
  format: "image/png8",
  transparent: true,
  tiled: true,
  opacity: 0.6,
  //cql_filter: "nombre_completo = 'LUIS ALFREDO RODRIGUEZ MOSQUERA'",
  zIndex: 100,
  attribution: "Data from wms acamafrut",
});

var wmsjoin = new L.tileLayer.wms(url_geoserver, {
  layers: "Acamafrut:join",
  format: "image/png8",
  transparent: true,
  tiled: true,
  opacity: 0.6,
  //cql_filter: "nombre_com = 'LUIS ALFREDO RODRIGUEZ MOSQUERA'",
  zIndex: 100,
  attribution: "Data from JOIN",
});

//http://localhost:8081/geoserver/Acamafrut/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Acamafrut:acamafrut&outputFormat=application/json
// Get WFS layers from GeoServer
var wfsURL_Acamafrut = url_geoserver_wfs + "version=1.0.0&request=GetFeature&typeName=Acamafrut:acamafrut&outputFormat=application/json";
var wfsURL_IGAC = url_geoserver_wfs + "version=1.0.0&request=GetFeature&typeName=Acamafrut:igac&outputFormat=application/json";
var wfsURL_JOIN = url_geoserver_wfs + "version=1.0.0&request=GetFeature&typeName=Acamafrut:join&outputFormat=application/json";

// WFS styling
var geojsonwfsstyleigac = {
  fillColor: "red",
  fillOpacity: 0.4,
  color: "yellow",
  weight: 2,
  opacity: 0.6,
};

var greenIcon = new L.Icon({
  iconUrl: './img/marcadoracamafrut.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

async function getWFSgeojson_igac() {
  try {
    var response = await fetch(wfsURL_IGAC);
    var r = await response.json();
    //console.log(r);
    return r;
  } catch (err) {
    console.log(err);
  }
}

async function getWFSgeojson_acamafrut() {
  try {
    var response = await fetch(wfsURL_Acamafrut);
    var r = await response.json();
    //console.log(r);
    return r;
  } catch (err) {
    console.log(err);
  }
}

async function getWFSgeojson_join() {
  try {
    var response = await fetch(wfsURL_JOIN);
    var r = await response.json();
    return r;
  } catch (err) {
    console.log(err);
  }
}


// WFS IGAC
getWFSgeojson_igac().then((data) => {
  var wfsPolylayer = L.geoJSON(data, {
    onEachFeature: function (f, l) {
      //console.log(f);
      var customOptions = {
        maxWindth: "500px",
        className: "customPop",
      };
      var popupContent =
        "<div><b>" +
        f.properties.codigo_mun +
        "</b><br/>" +
        f.properties.vereda_cod +
        "</div>";
      l.bindPopup(popupContent, customOptions);
    },
    style: geojsonwfsstyleigac,
  }).addTo(wfsIGAC);
  map.fitBounds(wfsPolylayer.getBounds());
});

//WFS ACAMAFRUT
getWFSgeojson_acamafrut().then((data) => {
  var wfsPoint = L.geoJSON(data, {
    onEachFeature: function (f, l) {
      var customOptions = {
        maxWindth: "100px",
        className: "customPop",
      };
      var popupContent = "<div><b>" + f.properties.nombre_com + "</b><br/>" + f.properties.nombre_org + "</div>";      
      L.marker([f.properties.latitud, f.properties.longitud], { icon: greenIcon }).bindPopup(popupContent, customOptions).addTo(wfsAcamafrut);
    }
  })
});

// WFS join
getWFSgeojson_join().then((data) => {
  var geojsonLayer = new L.geoJSON(data, {
    onEachFeature: function (f, l) {
      var customOptions = {
        maxWindth: "100px",
        className: "customPop",
      };
      var popupContent = "<div><b>" + f.properties.nombre_com + "</b><br/>" + f.properties.nombre_org + "</div>" + "</b><br/>" + f.properties.municipio + "</div>";
      L.marker([f.properties.latitud, f.properties.longitud], { icon: greenIcon }).bindPopup(popupContent, customOptions).addTo(wfsjoin);
    }
  })
});

// Map Attributers
var mAttr = "";

// OSM tiles
var osmUrl = "https://{s}.tile.osm.org/{z}/{x}/{y}.png";
var osm = L.tileLayer(osmUrl, { attribution: mAttr });

// CartoDB tiles
var cartodbUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
var cartodb = L.tileLayer(cartodbUrl, { attribution: mAttr });

var map = L.map("map", {
  center: [1.6160110695597527, -75.63057486597225],
  zoom: 10,
  minzoom: 3,
  layers: [osm],
});

var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  div.innerHTML += '<img src="http://localhost:8081/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=grupoacamafrut">';
  return div;
};
legend.addTo(map);

//web services layers
var baseLayers = {
  "Openstreet Map": osm,
  "CartoDB Light": cartodb,
};

//overlay layer
var overlayMaps = {
  "IGAC (WMS)": wmsIgac,
  "IGAC (WFS)": wfsIGAC,
  "ACAMAFRUT (WFS)": wfsAcamafrut,
  "ACAMAFRUT (WMS)": wmsacamafrut,
  "JOIN (WMS)": wmsjoin,
  "JOIN (WFS)": wfsjoin,
};

// add base layers
var controlLayers = L.control
  .layers(baseLayers, overlayMaps, { collapse: false })
  .addTo(map);

// Add SCALEBAR TO MAP
L.control
  .scale({
    metric: true,
    imperial: false,
    maxWindth: 100,
  })
  .addTo(map);

// Re.order map z-index
map.on("overlayadd", function (e) {
  wfsAcamafrut.bringToBack();
  wfsIGAC.bringToBack();
  wfsjoin.bringToBack();
});

// Funtion to clear
function clearResult() {
  document.getElementById("search-value").value = "";
}

var geojsonwfsstyle = {
  fillColor: "black",
  fillOpacity: 0.4,
  color: "blue",
  weight: 1,
  opacity: 06
};

async function getgeojson(){
  try {
    const response = await fetch(cqligac);
    return await response.json();
  }catch(err){
    console.log(err);
  }
}

getgeojson().then(data => {
  var geojsonLayer = new L.geoJSON(data,  {
    onEachFeature: function (f, l) {
      var popupContent = "<div><b>" + f.properties.nombre_com + "</b><br/>" + f.properties.nombre_org + "</div>";
      l.bindPopup(popupContent);
    },
    style:geojsonwfsstyle
  }).addTo(wfsjoin);
});

L.Control.geocoder().addTo(map);

// Filtar Municipio
const select = document.querySelector('#select');
const titulos = document.querySelectorAll('.opcion')
const opciones = document.querySelector('#opciones');
const contenidoSelect = document.querySelector('#select .contenido-select');
const hiddenInput = document.querySelector('#inputSelect');
const selectorCiudad = document.getElementById("ciudad");

document.querySelectorAll('#opciones > .opcion').forEach((opcion) => {
	opcion.addEventListener('click', (e) => {
		e.preventDefault();
		contenidoSelect.innerHTML = e.currentTarget.innerHTML;
    titulo.classList.toggle('active');
		select.classList.toggle('active');
		opciones.classList.toggle('active');
		//hiddenInput.value = e.currentTarget.querySelector('.titulo').innerText;
	});  
});

const searchProductor = (nombre) => {
  return fetch(wfsURL_JOIN).then((res) => res.json()).then((data) => {
    return data.features.find(({properties}) => properties.nombre_com.includes(nombre.toUpperCase()));
  });
};

const searchInput = document.getElementById("search-value");
const search = document.getElementById("search");
search.addEventListener("click", async () => {
  L.geoJSON(await searchProductor(searchInput.value)).addTo(map);
})

const getmunicipios_acamafrut = async () => {
  const responsemunicipios = await fetch(wfsURL_JOIN);
  const datamunicipios = await responsemunicipios.json();
  var municipios = datamunicipios.features

  const getLine = (namemunicipio) => municipios.filter(feature => feature.properties.municipio.includes(namemunicipio))

  //console.log(municipios);

  const municipialbania = getLine("ALBANIA");
  const municipiobalen = getLine("BELEN DE LOS ANDAQUIES");
  const municipiocartagena = getLine("CARTAGENA DEL CHAIRA");
  const municipiocurillo = getLine("CURILLO");
  const municipiodoncello = getLine("EL DONCELLO");
  const municipiopaujil = getLine("EL PAUJIL");
  const municipioflorencia = getLine("FLORENCIA");
  const municipiomontañita = getLine("LA MONTAÑITA");
  const municipiomorelia = getLine("MORELIA");
  const municipiomilan = getLine("PUERTO MILAN");
  const municipiopuerto_rico = getLine("PUERTO RICO");
  const municipiosan_jose = getLine("SAN JOSE DEL FRAGUA");
  const municipiosan_vicente = getLine("SAN VICENTE DEL CAGUAN");
  const municipiosolano = getLine("SOLANO");
  const municipiosolita = getLine("SOLITA");
  const municipiovalparaiso = getLine("VALPARAISO");

  selectorCiudad.addEventListener("change", (e) => {
    if(e.target.value === "Albania") {
      L.geoJSON(municipialbania).bindPopup(e.target.value).addTo(map);
    } else if (e.target.value === "Belén de los Andaquíes") {
      L.geoJSON(municipiobalen).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "Cartagena del Chairá") {
      L.geoJSON(municipiocartagena).bindPopup(e.target.value).addTo(map); 
    }else if (e.target.value === "Curillo") {
      L.geoJSON(municipiocurillo).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "El Doncello") {
      L.geoJSON(municipiodoncello).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "El Paujil") {
      L.geoJSON(municipiopaujil).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "Florencia") {
      L.geoJSON(municipioflorencia).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "La Montañita") {
      L.geoJSON(municipiomontañita).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "Morelia") {
      L.geoJSON(municipiomorelia).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "Puerto Milán") {
      L.geoJSON(municipiomilan).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "Puerto Rico") {
      L.geoJSON(municipiopuerto_rico).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "San José del Fragua") {
      L.geoJSON(municipiosan_jose).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "San Vicente del Caguán") {
      L.geoJSON(municipiosan_vicente).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "Solano") {
      L.geoJSON(municipiosolano).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "Solita") {
      L.geoJSON(municipiosolita).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "Valparaíso") {
      L.geoJSON(municipiovalparaiso).bindPopup(e.target.value).addTo(map);
    }else if (e.target.value === "all") {
      L.geoJSON(municipialbania).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiobalen).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiocartagena).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiocurillo).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiodoncello).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiopaujil).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipioflorencia).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiomontañita).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiomorelia).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiomilan).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiopuerto_rico).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiosan_jose).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiosan_vicente).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiosolano).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiosolita).bindPopup(e.target.value).addTo(map);
      L.geoJSON(municipiovalparaiso).bindPopup(e.target.value).addTo(map);
    }
  })
}

getmunicipios_acamafrut();


var minimap = new L.Control.minimap(cartodb,
  {
    toggleDisplay:true,
    minized:false,
    position:"bootomleft"
  }).addTo(map)
