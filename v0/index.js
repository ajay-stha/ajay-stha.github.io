var app =  new Vue({
    el: "#app_basic",
    data: {
      message: "🐵 Hello World 🔮",
      timestamp: `Timestamp ${new Date().toLocaleString()}`,
    },
    methods: {
      randomGenerate() {
        this.message = "🐵 Hello Whoever you are🔮";
      },
    },
  })
//setTimeout(ajaxLOAD, 30000);
        // Load the Google Visualization API library
        google.charts.load('current', { packages: ['table'] });

        // The global map variables.
        var _map;
        var _control;
        var _incidentsBounds;
        var that;
        


        // Query Traffic data once the Google Charts API is loaded
        google.charts.setOnLoadCallback(ajaxLOAD);
setInterval(ajaxLOAD, 30000);


function ajaxLOAD() {
            $.ajax({
                url: "https://traffic.mdpd.com/api/traffic",
                //url: "http://localhost:55207/api/traffic",
                // The name of the JSONP callback parameter
                jsonp: "callback",
                // Tell jQuery we're expecting JSONP
                dataType: "jsonp",
                // The accept type for the response
                data: {
                    format: "json"
                },
                // Handle response
                success: function (response) {
                    // Define the callback method which is called once the response is available.
                    responseCallback(response);
                }
            });
}

        /**
         * This method is called once the response is available, and the page has been loaded.
         */
        function responseCallback(response) {
            // Initialize the map.
            //initMap();
            // Display the traffic data.
            //displayTrafficDataOnMap(response);
            // Draw the table.
            drawTable(response);
        }

        /**
         * This method is used to draw a Google Visualization API Table, with Traffic data.
         */
        function drawTable(response) {
console.log(response);
            var data = new google.visualization.DataTable();
            
            data.addColumn('string', 'Signal');
            data.addColumn('string', 'Address');
            data.addColumn('string', 'Location');
            var signal, address, location;
            if(typeof that=== 'object')
             {

               if(that[0].Address != response[0].Address)
               {
                  alert('New Incident at: '+response[0].Address);
               }
             }
            for (var key in response) {
                signal = response[key].Signal == "TRAFFIC ACCIDENT" ? "vehicle collision" : response[key].Signal ;
                address = response[key].Address;
                location = response[key].Location;
                data.addRow([signal, address, location]);
            }
            that = response;
            // Draw the table.
            var table = new google.visualization.Table(document.getElementById('table_div'));
            var options = {
                showRowNumber: true,
                cssClassNames: { oddTableRow: 'OddRowStyle', evenTableRow: 'EvenRowStyle' },
                width: '100%'
            }
            table.draw(data, options);
        }

        /**
         * This method is used to initialize the map.
         */
        function initMap() {
            var ESRI_MapTilesUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png';

            var OSM_MapTilesUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            var OSM_SubDomains = ['a', 'b', 'c'];

            var licAttribute = 'Map data courtesy of <a href="https://www.mdpd.com">Miami-Dade Police</a>, ' +
                'Tiles &copy; <a href="https://www.esri.com/software/arcgis/community-maps-program">Esri</a>, ' +
                '<a href="https://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';

            // Define Tile Layers
            var ESRI_MapLayer = new L.tileLayer(ESRI_MapTilesUrl, {
                maxZoom: 19,
                attribution: licAttribute
            });
            var OSM_MapLayer = new L.tileLayer(OSM_MapTilesUrl, {
                maxZoom: 18,
                attribution: licAttribute,
                subdomains: OSM_SubDomains
            });

            // Create Map
            _map = L.map('map', {
                center: [25.77117470, -80.37158830],
                zoom: 15,
                minZoom: 2,
                layers: [ESRI_MapLayer]
            });

            // Layer Control KeyValues for BaseLayers
            var baseLayers = {
                "<b>Map</b> - Esri World Street Map": ESRI_MapLayer,
                "<b>Map (Backup)</b> - OpenStreetMap": OSM_MapLayer
            };

            // Create the Layers Control and add it to the Map
            _control = L.control.layers(baseLayers).addTo(_map);

            // Set the zoom on the map to the max on the current Layer
            _map.on('baselayerchange', function (e) {
                // If zoom is beyond the OSM Layer max, and we are switching to OSM Layer, then set zoom to OSM max zoom.
                if (e.layer == OSM_MapLayer) {
                    if (_map.getZoom() > 18) {
                        _map.setZoom(18);
                    }
                }
            });

            // Define the location icon to use when showing the user's location
            var locationIcon = L.icon({
                iconUrl: 'location-24x24.png',
                iconRetinaUrl: 'location-48x48.png',
                iconSize: [24, 24]
            });

            // Define the event handlers for when a location is found or not
            var locationMarker;
            _map.on('locationfound', function (e) {
                // If locationMarker was created, then just update its lat and lng.
                if (locationMarker) {
                    // Update the lat and lng of the marker
                    locationMarker.setLatLng(e.latlng);
                } else {
                    // Create a marker for the user's location
                    locationMarker = L.marker(e.latlng, { icon: locationIcon }).addTo(_map);
                    // Add the marker as an overlay in the control
                    _control.addOverlay(locationMarker, "<b>My Location<b />");
                }
            });
            _map.on('locationerror', function (e) {
                alert(e.message);
            });

            // Define the event handlers which will control location tracking
            _map.on('overlayremove', function (e) {
                if (e.layer == locationMarker) {
                    // Stop locating user
                    _map.stopLocate();
                    // Zoom into all traffic incidents
                    _map.fitBounds(_incidentsBounds);
                }
            });
            _map.on('overlayadd', function (e) {
                if (e.layer == locationMarker) {
                    // Try to locate the user
                    _map.locate({ setView: true, maxZoom: 12, watch: true });
                }
            });

            // Try to locate the user
            _map.locate({ setView: true, maxZoom: 12, watch: true });
        }

        /**
         * This method is used to display traffic data on the map.
         */
        function displayTrafficDataOnMap(response) {
            var signal, address, location, lat, lon, markerText, marker, markerGroup = [];
            // Display incidents on map
            for (var key in response) {
                // Check if the incident has a lat and lng.
                if ((response[key].Latitude == null) || (response[key].Longitude == null)) {
                    continue;
                }
                // Get incident values.
                signal = response[key].Signal ? response[key].Signal : '';
                address = response[key].Address ? response[key].Address : '';
                location = response[key].Location ? response[key].Location : '';
                lat = response[key].Latitude ? response[key].Latitude : '';
                lon = response[key].Longitude ? response[key].Longitude : '';
                // Create map markers.
                markerText = "Signal: <b>" + signal + "</b><br />Address: <b>" + address + "</b><br />Location: <b>" + location + "</b>";
                marker = L.marker([lat, lon]).bindPopup(markerText);
                markerGroup.push(marker);
            }
            // Check if there are any coordinates to show on the map.
            if (markerGroup.length > 0) {
                // Add marker group to the map.
                var features = L.featureGroup(markerGroup).addTo(_map);
                // Fit the markers within the view area of the map.
                _incidentsBounds = features.getBounds()
                _map.fitBounds(_incidentsBounds);
                // Add features overlay to map control.
                _control.addOverlay(features, "<b>Traffic Incidents</b>");
            }
        }
