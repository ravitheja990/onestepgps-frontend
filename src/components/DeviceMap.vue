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
          <td>{{ device.active ? 'Active' : 'Inactive' }}</td>
          <td>{{ device.current_position.lat }}</td>
          <td>{{ device.current_position.lng }}</td>
          <td>{{ device.current_position.alt }}</td>
          <td>{{ device.current_position.ang }}</td>
          <td>{{ device.current_position.sp }}</td>
          <td>{{ capitalizeFirstLetter(device.drive_status) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      devices: [], // Holds the device data fetched from the server
    };
  },
  methods: {
    capitalizeFirstLetter(text) {
      if (!text) return '';
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
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    },
  },
  mounted() {
    this.fetchDevices();
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
</style>
