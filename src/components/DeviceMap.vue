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
      let sortedDevices = [...this.devices];
      if (this.preferences.sortOrder === "name") {
        sortedDevices.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.preferences.sortOrder === "status") {
        sortedDevices.sort((a, b) => a.active - b.active);
      } else if (this.preferences.sortOrder === "latitude") {
        sortedDevices.sort((a, b) => a.current_position.lat - b.current_position.lat);
      }

      if (this.preferences.hideInactive) {
        sortedDevices = sortedDevices.filter((device) => device.active);
      }

      return sortedDevices;
    },
  },
  watch: {
    "preferences.mapZoomLevel"(newZoom) {
      if (this.map) {
        this.map.setZoom(newZoom);
      }
    },
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

        const response = await axios.get("http://localhost:8080/devices", {
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
    async fetchPreferences() {
      try {
        const sessionEmail = localStorage.getItem("sessionEmail");
        if (!sessionEmail) {
          console.error("Session email is missing.");
          return;
        }

        const response = await axios.get("http://localhost:8080/preferences/get", {
          headers: {
            "X-Session-Email": sessionEmail,
          },
        });

        console.log("response is :: ", response.data);

        this.preferences = {
          sortOrder: response.data.sortOrder || "name",
          hideInactive: response.data.hideInactive || false,
          mapZoomLevel: response.data.mapZoomLevel || 10,
        };

        localStorage.setItem("userPreferences", JSON.stringify(this.preferences));
        this.preferencesLoaded = true;

        if (this.map) {
          this.map.setZoom(this.preferences.mapZoomLevel);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error.response?.data || error.message);
        const savedPreferences = localStorage.getItem("userPreferences");
        if (savedPreferences) {
          this.preferences = JSON.parse(savedPreferences);
        }
        this.preferencesLoaded = true;
      }
    },
    initializeMap() {
      this.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 34.0549, lng: -118.2426 },
        zoom: this.preferences.mapZoomLevel,
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
    async savePreferences() {
      try {
        const sessionEmail = localStorage.getItem("sessionEmail");
        if (!sessionEmail) {
          console.error("Session email is missing.");
          return;
        }

        const preferencesToSave = {
          ...this.preferences,
          mapZoomLevel: Number(this.preferences.mapZoomLevel),
        };

        await axios.post(
          "http://localhost:8080/preferences",
          preferencesToSave,
          {
            headers: {
              "X-Session-Email": sessionEmail,
            },
          }
        );

        localStorage.setItem("userPreferences", JSON.stringify(this.preferences));
        alert("Preferences saved successfully!");
      } catch (error) {
        console.error("Error saving preferences:", error.response?.data || error.message);
      }
    },
  },
  async mounted() {
    try {
      await this.fetchPreferences();
      this.initializeMap();
      this.fetchDevices();
      setInterval(this.fetchDevices, 5000);
    } catch (error) {
      console.error("Error in mounted lifecycle:", error);
    }
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
