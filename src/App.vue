<template>
  <div id="app">
    <div v-if="!isLoggedIn">
      <LoginSignup @auth-success="handleAuthSuccess" />
    </div>
    <div v-else>
      <header style="display: flex; justify-content: flex-end; align-items: center; padding: 10px; background-color: #f8f9fa;">
        <button @click="logout" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Logout</button>
      </header>

      <main>
        <DeviceMap />
      </main>
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

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

main {
  padding: 20px;
}
</style>
