<template>
  <div>
    <h1>GPS Device Tracker</h1>

    <h2 style="text-align: center;">User Preferences</h2>
    <form @submit.prevent="savePreferences" style="text-align: center; margin-bottom: 20px;">
      <label>
        Sort Order:
        <select v-model="preferences.sortOrder">
          <option value="name">Name</option>
          <option value="status">Status</option>
          <option value="latitude">Latitude</option>
        </select>
      </label>
      <label style="margin-left: 20px;">
        Hide Inactive Devices:
        <input type="checkbox" v-model="preferences.hideInactive" />
      </label>
      <label style="margin-left: 20px;">
        Default Map Zoom Level:
        <input type="number" v-model="preferences.mapZoomLevel" min="1" max="20" />
      </label>
      <button type="submit" style="margin-left: 20px;">Save Preferences</button>
    </form>

    <h2 style="text-align: center;">GPS List Table</h2>
    <div style="overflow-x: auto;">
      <table border="1" style="width: 100%; text-align: center; border-collapse: collapse;">
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
          <tr v-for="(device, index) in filteredDevices" :key="device.id">
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
    </div>

    <h2 style="text-align: center; margin-top: 20px;">Map View</h2>
    <div id="map" style="width: 100%; height: 500px; border: 1px solid #ddd;"></div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      devices: [],
      preferences: {
        sortOrder: "name",
        hideInactive: false,
        mapZoomLevel: 10,
      },
      preferencesLoaded: false,
      map: null,
      markers: {},
    };
  },
  computed: {
    filteredDevices() {
      let sorted = [...this.devices];
      const sortKey = this.preferences.sortOrder;

      sorted.sort((a, b) => {
        if (sortKey === "name") return a.name.localeCompare(b.name);
        if (sortKey === "status") return a.active - b.active;
        if (sortKey === "latitude") return a.current_position.lat - b.current_position.lat;
      });

      return this.preferences.hideInactive ? sorted.filter((d) => d.active) : sorted;
    },
  },
  watch: {
    "preferences.mapZoomLevel"(zoom) {
      if (this.map) this.map.setZoom(zoom);
    },
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    async fetchDevices() {
      try {
        const email = localStorage.getItem("sessionEmail");
        if (!email) return console.error("Missing session email.");

        const { data } = await axios.get("http://localhost:8080/devices", {
          headers: { "X-Session-Email": email },
        });

        this.devices = data.map((d) => ({
          id: d.id,
          name: d.display_name,
          active: d.online,
          drive_status: d.drive_status,
          current_position: {
            lat: d.current_position.Lat,
            lng: d.current_position.Lng,
            alt: d.current_position.Alt,
            ang: d.current_position.Angle,
            sp: d.current_position.Speed,
          },
        }));
        this.updateMapMarkers();
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    },
    async fetchPreferences() {
      try {
        const email = localStorage.getItem("sessionEmail");
        if (!email) return console.error("Missing session email.");

        const { data } = await axios.get("http://localhost:8080/preferences/get", {
          headers: { "X-Session-Email": email },
        });

        Object.assign(this.preferences, data);
        localStorage.setItem("userPreferences", JSON.stringify(this.preferences));
        this.preferencesLoaded = true;
        if (this.map) this.map.setZoom(this.preferences.mapZoomLevel);
      } catch (err) {
        console.error("Error fetching preferences:", err);
        const saved = localStorage.getItem("userPreferences");
        if (saved) this.preferences = JSON.parse(saved);
      }
    },
    initializeMap() {
      this.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 34.0549, lng: -118.2426 },
        zoom: this.preferences.mapZoomLevel,
      });
    },
    updateMapMarkers() {
      this.devices.forEach((d) => {
        const pos = { lat: d.current_position.lat, lng: d.current_position.lng };
        if (!this.markers[d.id]) {
          this.markers[d.id] = new google.maps.Marker({ position: pos, map: this.map, title: d.name });
        } else {
          this.markers[d.id].setPosition(pos);
        }
      });
    },
    async savePreferences() {
      try {
        const email = localStorage.getItem("sessionEmail");
        if (!email) return console.error("Missing session email.");

        const prefs = { ...this.preferences, mapZoomLevel: +this.preferences.mapZoomLevel };
        await axios.post("http://localhost:8080/preferences", prefs, {
          headers: { "X-Session-Email": email },
        });

        localStorage.setItem("userPreferences", JSON.stringify(this.preferences));
        alert("Preferences saved successfully!");
      } catch (err) {
        console.error("Error saving preferences:", err);
      }
    },
  },
  async mounted() {
    await this.fetchPreferences();
    this.initializeMap();
    this.fetchDevices();
    setInterval(this.fetchDevices, 5000);
  },
};
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 20px;
}

table th,
table td {
  padding: 10px;
  border: 1px solid #ddd;
}

thead th {
  background-color: #f9f9f9;
}

#map {
  margin-top: 20px;
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
}
</style>
