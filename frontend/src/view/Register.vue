<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import api from "../services/api"

const router = useRouter()

const form = ref({
  email: "",
  password: "",
  confirm_password: "",
  first_name: "",
  last_name: ""
})

const error = ref("")
const success = ref("")

const register = async () => {
  try {
    await api.post("/auth/register", form.value)

    success.value = "สมัครสมาชิกสำเร็จ 🎸"
    error.value = ""

    setTimeout(() => router.push("/login"), 1500)

  } catch (err) {
    error.value = err.response?.data?.message || "เกิดข้อผิดพลาด"
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative">

    <!-- Background Image -->
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
            Create your musician account
          </p>
        </div>

        <!-- Success -->
        <p v-if="success" class="text-green-600 text-center mb-3">
          {{ success }}
        </p>

        <!-- Error -->
        <p v-if="error" class="text-red-500 text-center mb-3">
          {{ error }}
        </p>

        <!-- Name -->
        <div class="grid grid-cols-2 gap-3">
          <input v-model="form.first_name" placeholder="First name" class="input-minimal" />
          <input v-model="form.last_name" placeholder="Last name" class="input-minimal" />
        </div>

        <!-- Email -->
        <input v-model="form.email" placeholder="Email" class="input-minimal mt-3" />

        <!-- Password -->
        <input type="password" v-model="form.password" placeholder="Password" class="input-minimal mt-3" />

        <!-- Confirm Password -->
        <input type="password" v-model="form.confirm_password" placeholder="Confirm Password" class="input-minimal mt-3" />

        <!-- Button -->
        <button
          @click="register"
          class="w-full mt-6 bg-[#3b2f2f] hover:bg-[#2a2121]
                 text-white font-medium py-2 rounded-lg
                 transition duration-300 hover:scale-[1.02]"
        >
          Register 🎸
        </button>

        <!-- Login link -->
        <p class="text-center text-sm text-gray-600 mt-5">
          Already have account ?
          <router-link
            to="/login"
            class="text-[#3b2f2f] font-semibold hover:underline"
          >
            Login
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
