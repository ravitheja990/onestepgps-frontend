<template>
  <div>
    <h1>{{ isSignup ? "Signup" : "Login" }}</h1>
    <form @submit.prevent="handleSubmit">
      <label>
        Email:
        <input type="email" v-model="form.email" required />
      </label>
      <label>
        Password:
        <input type="password" v-model="form.password" required />
      </label>
      <div v-if="isSignup">
        <label>
          Confirm Password:
          <input type="password" v-model="form.confirmPassword" required />
        </label>
      </div>
      <button type="submit">{{ isSignup ? "Signup" : "Login" }}</button>
    </form>
    <button @click="toggleMode">
      Switch to {{ isSignup ? "Login" : "Signup" }}
    </button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      isSignup: false,
      form: {
        email: "",
        password: "",
        confirmPassword: "",
      },
    };
  },
  methods: {
    toggleMode() {
      this.isSignup = !this.isSignup;
    },
    async handleSubmit() {
      const { email, password, confirmPassword } = this.form;

      if (this.isSignup && password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const url = `http://localhost:8080/${this.isSignup ? "signup" : "login"}`;
        const payload = { email, password };
        const response = await axios.post(url, payload);

        if (response.status === (this.isSignup ? 201 : 200)) {
          alert(this.isSignup ? "Signup successful! Please log in." : "Login successful!");

          if (!this.isSignup) {
            localStorage.setItem("sessionEmail", email);
            this.$emit("auth-success");
          }

          this.resetForm();
          if (this.isSignup) this.isSignup = false;
        }
      } catch (error) {
        if (error.response?.status === 409 && this.isSignup) {
          alert("User already registered. Please log in.");
        } else {
          alert(error.response?.data?.message || "An error occurred");
        }
      }
    },
    resetForm() {
      this.form.email = "";
      this.form.password = "";
      this.form.confirmPassword = "";
    },
  },
};
</script>

<style scoped>
form {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 5px;
}

button {
  margin-top: 5px 10px;
  padding: 10px;
  cursor: pointer;
}

button[type="submit"] {
  align-self: start;
}
</style>
