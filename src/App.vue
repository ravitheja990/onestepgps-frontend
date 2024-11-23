<template>
  <div id="app">
    <div v-if="!isLoggedIn">
      <LoginSignup @auth-success="handleAuthSuccess" />
    </div>
    <div v-else>
      <DeviceMap />
      <button @click="logout" style="margin-top: 20px;">Logout</button>
    </div>
  </div>
</template>

<script>
import DeviceMap from './components/DeviceMap.vue';
import LoginSignup from './components/LoginSignup.vue';

export default {
  components: {
    DeviceMap,
    LoginSignup,
  },
  data() {
    return {
      isLoggedIn: false, // Tracks user login status
    };
  },
  created() {
    // Check if user is already logged in by verifying token
    const token = localStorage.getItem("token");
    if (token) {
      // Optionally verify token with the backend or decode it
      this.isLoggedIn = true;
    }
  },
  methods: {
    handleAuthSuccess(token) {
      // Save the token and update login status
      localStorage.setItem("token", token);
      this.isLoggedIn = true;
    },
    logout() {
      // Clear token and update login status
      localStorage.removeItem("token");
      this.isLoggedIn = false;
    },
  },
};
</script>
