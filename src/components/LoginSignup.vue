<template>
  <div>
    <h1>{{ isSignup ? "Signup" : "Login" }}</h1>
    <form @submit.prevent="handleSubmit">
      <label>
        Email:
        <input type="email" v-model="form.email" required />
      </label>
      <br />
      <label>
        Password:
        <input type="password" v-model="form.password" required />
      </label>
      <br />
      <div v-if="isSignup">
        <label>
          Confirm Password:
          <input type="password" v-model="form.confirmPassword" required />
        </label>
        <br />
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
      isSignup: false, // Toggles between Signup and Login
      form: {
        email: "",
        password: "",
        confirmPassword: "",
      },
    };
  },
  methods: {
    toggleMode() {
      this.isSignup = !this.isSignup; // Switch between Signup and Login
    },
    async handleSubmit() {
      try {
        if (this.isSignup) {
          // Signup Logic
          if (this.form.password !== this.form.confirmPassword) {
            alert("Passwords do not match!");
            return;
          }

          // Call Signup API
          const response = await axios.post("http://localhost:8080/signup", {
            email: this.form.email,
            password: this.form.password,
          });

          if (response.status === 201) {
            alert("Signup successful! Please log in.");
            this.isSignup = false; // Switch to Login mode
          }
        } else {
          // Login Logic
          const response = await axios.post("http://localhost:8080/login", {
            email: this.form.email,
            password: this.form.password,
          });

          if (response.status === 200) {
            alert("Login successful!");
            localStorage.setItem("sessionEmail", this.form.email); // Save email to localStorage
            this.$emit("auth-success"); // Notify the parent component
          }
        }

        // Reset the form
        this.form.email = "";
        this.form.password = "";
        this.form.confirmPassword = "";
      } catch (error) {
        alert(error.response?.data?.message || "An error occurred");
      }
    },
  },
};
</script>

<style scoped>
form {
  margin: 20px 0;
}
input {
  margin: 10px 0;
}
button {
  margin-top: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
