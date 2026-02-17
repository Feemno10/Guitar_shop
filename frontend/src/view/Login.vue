<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import api from "../services/api"

const router = useRouter()

const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)

const login = async () => {

  if (loading.value) return

  try {

    loading.value = true
    error.value = ""

    const res = await api.post("/auth/login", {
      email: email.value,
      password: password.value
    })

    /* ✅ เก็บข้อมูลสำคัญ */
    localStorage.setItem("token", res.data.token)
    localStorage.setItem("user", JSON.stringify(res.data.user))
    localStorage.setItem("role", res.data.user.role)

    /* ✅ redirect ตาม role */
    if (res.data.user.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/")
    }

  } catch (err) {

    error.value = err.response?.data?.message || "Login failed"

  } finally {
    loading.value = false
  }
}
</script>



<template>
  <div class="min-h-screen flex items-center justify-center relative">

    <!-- Background -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1920')"
    ></div>

    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

    <!-- Content -->
    <div class="relative w-full max-w-md px-4">

      <!-- Card -->
      <div class="bg-white/90 shadow-2xl rounded-2xl p-8 border border-white/40">

        <!-- Title -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-semibold tracking-wide text-gray-900">
            Guitar Shop
          </h1>

          <p class="text-sm text-gray-500 mt-1">
            Welcome back musician 🎸
          </p>
        </div>

        <!-- Error -->
        <p v-if="error" class="text-red-500 text-center mb-4">
          {{ error }}
        </p>

        <!-- Email -->
        <input
          v-model="email"
          placeholder="Email"
          class="input-minimal"
        />

        <!-- Password -->
        <input
          type="password"
          v-model="password"
          placeholder="Password"
          class="input-minimal mt-3"
        />

        <!-- Button -->
        <button
          @click="login"
          class="w-full mt-6 bg-[#3b2f2f] hover:bg-[#2a2121]
                 text-white font-medium py-2 rounded-lg
                 transition duration-300 hover:scale-[1.02]"
        >
          Login 🎸
        </button>

        <!-- Register link -->
        <p class="text-center text-sm text-gray-600 mt-5">
          Don't have account ?
          <router-link
            to="/register"
            class="text-[#3b2f2f] font-semibold hover:underline"
          >
            Register
          </router-link>
        </p>

      </div>

    </div>
  </div>
</template>

<style scoped>
.input-minimal {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  outline: none;
  transition: 0.2s;
  background: rgba(255,255,255,0.85);
}

.input-minimal:focus {
  border-color: #3b2f2f;
  box-shadow: 0 0 0 2px rgba(59, 47, 47, 0.15);
}
</style>
