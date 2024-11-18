<template>
  <div>
    <h1>GPS Device Tracker</h1>

    <h2 style="text-align: center;">GPS List Table</h2>
    <!-- Device List Table -->
    <table border="1">
      <thead>
        <tr>
          <th rowspan="2">S.No</th>
          <th rowspan="2">Device Name</th>
          <th rowspan="2">Status</th>
          <th colspan="5">Current Position</th>
          <th rowspan="2">Drive Status</th>
        </tr>
        <tr>
          <th>Latitude</th>
          <th>Longitude</th>
          <th>Altitude</th>
          <th>Angle</th>
          <th>Speed</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(device, index) in devices" :key="device.id">
          <td>{{ index + 1 }}</td>
          <td>{{ device.name }}</td>
          <td>{{ device.active ? "Active" : "Inactive" }}</td>
          <td>{{ device.current_position.lat }}</td>
          <td>{{ device.current_position.lng }}</td>
          <td>{{ device.current_position.alt }}</td>
          <td>{{ device.current_position.ang }}</td>
          <td>{{ device.current_position.sp }}</td>
          <td>{{ capitalizeFirstLetter(device.drive_status) }}</td>
        </tr>
      </tbody>
    </table>

    <h2 style="text-align: center;">Map View</h2>
    <!-- Map Container -->
    <div id="map" style="width: 100%; height: 500px;"></div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      devices: [], // Holds the device data fetched from the server
      map: null, // Google Map instance
      markers: {}, // Stores markers for devices by their IDs
    };
  },
  methods: {
    showDeviceInfo(device) {
      // You can customize this to use a modal or display it in the UI
      alert(`
        Device Name: ${device.name}
        Status: ${device.active ? "Active" : "Inactive"}
        Drive Status: ${device.drive_status}
        Latitude: ${device.current_position.lat}
        Longitude: ${device.current_position.lng}
        Altitude: ${device.current_position.alt}
        Angle: ${device.current_position.ang}
        Speed: ${device.current_position.sp}
      `);
    },
    capitalizeFirstLetter(text) {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    async fetchDevices() {
      try {
        const response = await axios.get("http://localhost:8080/api/devices");
        this.devices = response.data.map((device) => ({
          id: device.id,
          name: device.display_name,
          active: device.active,
          drive_status: device.drive_status,
          current_position: {
            lat: device.current_position.Lat,
            lng: device.current_position.Lng,
            alt: device.current_position.Alt,
            ang: device.current_position.Angle,
            sp: device.current_position.Speed,
          },
        }));

        // Update the markers on the map
        this.updateMapMarkers();
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    },
    initializeMap() {
      this.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 34.0549, lng: -118.2426 }, // Default center (Los Angeles), just kept as we are here
        zoom: 8,
      });
    },
    updateMapMarkers() {
      console.log("Devices data: ", JSON.parse(JSON.stringify(this.devices)));

      if (!this.map) {
        console.error("Map is not initialized.");
        return;
      }

      this.devices.forEach((device) => {
        const position = {
          lat: device.current_position.lat,
          lng: device.current_position.lng,
        };

        if (!position.lat || !position.lng) {
          console.warn("Invalid position for device: ", device.name, position);
          return;
        }

        console.log("Creating/updating marker for device: ", device.name, position);

        if (this.markers[device.id]) {
          // Update marker position if it already exists
          this.markers[device.id].setPosition(position);
          console.log("Marker updated for device: ", device.name);
        } else {
          // Create a new marker if it doesn't exist
          const marker = new google.maps.Marker({
            position,
            map: this.map,
            title: device.name,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Use a distinct marker icon
              scaledSize: new google.maps.Size(32, 32),
            },
            label: {
              text: device.name,
              color: "black",
              fontSize: "12px",
              fontWeight: "bold",
            },
          });

          // Attach click event listener to the marker
          marker.addListener("click", () => {
            this.showDeviceInfo(device);
          });

          // Store the marker in the markers object
          this.markers[device.id] = marker;
          console.log("Marker added for device: ", device.name);
        }
      });

      console.log("Markers added/updated: ", Object.keys(this.markers));
    },
  },
  mounted() {
    // Initialize the map
    this.initializeMap();

    // Fetch devices initially and periodically update
    this.fetchDevices();
    setInterval(this.fetchDevices, 5000); // Update every 5 seconds
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

table th,
table td {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

table th {
  background-color: #f4f4f4;
}

table tr:nth-child(even) {
  background-color: #f9f9f9;
}

#map {
  margin-top: 20px;
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
}
</style>
