<template>
  <div id="app">
    <div v-if="!isLoggedIn">
      <LoginSignup @auth-success="handleAuthSuccess" />
    </div>
    <div v-else>
      <header class="app-header">
        <button @click="logout" class="logout-btn">Logout</button>
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
      isLoggedIn: !!localStorage.getItem("token"),
    };
  },
  methods: {
    handleAuthSuccess(token) {
      localStorage.setItem("token", token);
      this.isLoggedIn = true;
    },
    logout() {
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

.app-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logout-btn {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

main {
  padding: 20px;
}
</style>
