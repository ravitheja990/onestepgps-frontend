<template>
  <div>
    <h1>GPS Device Tracker</h1>

    <h2 style="text-align: center;">GPS List Table</h2>
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
    <div id="map"></div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      devices: [],
      map: null,
      markers: {},
    };
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    async fetchDevices() {
      try {
        const sessionEmail = localStorage.getItem("sessionEmail");
        if (!sessionEmail) {
          console.error("Session email is missing.");
          return;
        }

        const response = await axios.get("http://localhost:8080/api/devices", {
          headers: {
            "X-Session-Email": sessionEmail,
          },
        });

        this.devices = response.data.map((device) => ({
          id: device.id,
          name: device.display_name,
          active: device.online,
          drive_status: device.drive_status,
          current_position: {
            lat: device.current_position.Lat,
            lng: device.current_position.Lng,
            alt: device.current_position.Alt,
            ang: device.current_position.Angle,
            sp: device.current_position.Speed,
          },
        }));

        this.updateMapMarkers();
      } catch (error) {
        console.error("Error fetching devices:", error.response?.data || error.message);
      }
    },
    initializeMap() {
      this.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 34.0549, lng: -118.2426 },
        zoom: 9,
      });
    },
    updateMapMarkers() {
      this.devices.forEach((device) => {
        const position = { lat: device.current_position.lat, lng: device.current_position.lng };

        if (!this.markers[device.id]) {
          const marker = new google.maps.Marker({
            position,
            map: this.map,
            title: device.name,
          });

          this.markers[device.id] = marker;
        } else {
          this.markers[device.id].setPosition(position);
        }
      });
    },
  },
  mounted() {
    this.initializeMap();
    this.fetchDevices();
    setInterval(this.fetchDevices, 5000);
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

#map {
  margin-top: 20px;
  width: 100%;
  height: 500px;
}
</style>
