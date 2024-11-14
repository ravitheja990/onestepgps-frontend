<template>
    <div>
      <h1>GPS Device Tracker</h1>
  
      <!-- List of Devices with Edit Options -->
      <div>
        <h2>Devices</h2>
        <ul>
          <li v-for="device in devices" :key="device.id">
            <span>{{ device.name }} - Status: {{ device.status }} - Position: ({{ device.lat }}, {{ device.lng }})</span>
            <button @click="editPreferences(device)">Edit Preferences</button>
          </li>
        </ul>
      </div>
  
      <!-- Google Maps Display for Device Locations -->
      <GmapMap
        :center="{ lat: 37.7749, lng: -122.4194 }"
        :zoom="10"
        style="width: 100%; height: 400px"
      >
        <GmapMarker
          v-for="device in devices"
          :key="device.id"
          :position="{ lat: device.lat, lng: device.lng }"
        />
      </GmapMap>
  
      <!-- Preferences Modal for Device Customization -->
      <div v-if="showPreferencesModal">
        <h3>Edit Preferences</h3>
        <label>Sort Order:
          <input type="text" v-model="preferences.sortOrder" />
        </label>
        <label>Hide Device:
          <input type="checkbox" v-model="preferences.hideDevice" />
        </label>
        <button @click="savePreferences">Save Preferences</button>
        <button @click="closePreferences">Cancel</button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { GmapMap, GmapMarker } from 'vue2-google-maps';
  
  export default {
    data() {
      return {
        devices: [],
        showPreferencesModal: false,
        preferences: {},
        selectedDevice: null,
      };
    },
    methods: {
      async fetchDevices() {
        try {
          const response = await axios.get('/api/devices');
          this.devices = response.data;
        } catch (error) {
          console.error("Failed to fetch devices:", error);
        }
      },
      editPreferences(device) {
        this.selectedDevice = device;
        this.preferences = { ...device.preferences };
        this.showPreferencesModal = true;
      },
      async savePreferences() {
        try {
          await axios.post(`/api/devices/${this.selectedDevice.id}/preferences`, this.preferences);
          this.showPreferencesModal = false;
          this.fetchDevices();
        } catch (error) {
          console.error("Failed to save preferences:", error);
        }
      },
      closePreferences() {
        this.showPreferencesModal = false;
      }
    },
    mounted() {
      this.fetchDevices();
    },
    components: {
      GmapMap,
      GmapMarker
    },
  };
  </script>
  
  <style scoped>
  /* Basic styling */
  </style>
  