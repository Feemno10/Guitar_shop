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
const loading = ref(false)

const register = async () => {
  if (loading.value) return

  // Basic Validation
  if (form.value.password !== form.value.confirm_password) {
      error.value = "Passwords do not match."
      return
  }

  try {
    loading.value = true
    error.value = ""
    success.value = ""

    await api.post("/auth/register", form.value)

    success.value = "Account created successfully! Redirecting..."
    
    // Delay เล็กน้อยให้ผู้ใช้เห็นข้อความสำเร็จ
    setTimeout(() => router.push("/login"), 2000)

  } catch (err) {
    error.value = err.response?.data?.message || "An error occurred. Please try again."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen w-full bg-[#fafaf9] font-sans text-stone-900 selection:bg-amber-500 selection:text-white">

    <div class="hidden lg:flex w-1/2 relative bg-black overflow-hidden group">
      <img 
        src="https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=1920&auto=format&fit=crop" 
        class="absolute inset-0 w-full h-full object-cover opacity-70 grayscale transition duration-[2000ms] ease-out group-hover:scale-105 group-hover:grayscale-0"
        alt="Register Background"
      />
      
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      
      <div class="relative z-10 m-auto text-center px-12 animate-fade-in-up">
        <h2 class="text-4xl font-bold text-white tracking-widest mb-4">JOIN THE <span class="text-amber-500 font-light">LEGACY</span></h2>
        <div class="w-12 h-0.5 bg-amber-500 mx-auto mb-6"></div>
        <p class="text-stone-300 font-light tracking-wide leading-relaxed italic max-w-md mx-auto">
          "Where words fail, music speaks. Start your journey with the finest instruments."
        </p>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative bg-white lg:rounded-l-[2.5rem] shadow-[-20px_0_40px_rgba(0,0,0,0.05)] lg:-ml-6 z-20 overflow-y-auto">
      
      <button 
        @click="$router.push('/login')"
        class="absolute top-8 left-8 text-stone-400 hover:text-stone-900 transition flex items-center gap-2 text-sm font-medium lg:hidden"
      >
        <span>←</span> Back
      </button>

      <div class="w-full max-w-sm mt-10 lg:mt-0 animate-fade-in">
        
        <div class="flex justify-center lg:justify-start mb-8">
            <div class="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center shadow-sm border border-stone-100 p-3">
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/4472/4472584.png" 
                    alt="Feem Guitar Logo" 
                    class="w-full h-full object-contain opacity-80"
                />
            </div>
        </div>

        <div class="mb-8 text-center lg:text-left">
          <h1 class="text-3xl font-bold tracking-tight mb-2 text-stone-900">Create Account</h1>
          <p class="text-stone-500 text-sm font-light">Become a member of Feem Guitar Shop.</p>
        </div>

        <transition-group name="fade">
            <div v-if="error" key="err" class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {{ error }}
            </div>
            <div v-if="success" key="succ" class="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl flex items-center gap-3">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                {{ success }}
            </div>
        </transition-group>

        <form @submit.prevent="register" class="space-y-4">
          
          <div class="flex flex-col md:flex-row gap-4">
              <div class="group relative w-full">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">First Name</label>
                <input 
                    v-model="form.first_name" 
                    type="text" 
                    placeholder="John" 
                    class="w-full px-4 py-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none text-stone-800 placeholder-stone-400 font-medium" 
                    required 
                />
              </div>
              <div class="group relative w-full">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">Last Name</label>
                <input 
                    v-model="form.last_name" 
                    type="text" 
                    placeholder="Doe" 
                    class="w-full px-4 py-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none text-stone-800 placeholder-stone-400 font-medium" 
                    required 
                />
              </div>
          </div>

          <div class="group relative">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">Email Address</label>
            <input 
                v-model="form.email" 
                type="email" 
                placeholder="name@example.com" 
                class="w-full px-4 py-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none text-stone-800 placeholder-stone-400 font-medium" 
                required 
            />
          </div>

          <div class="group relative">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">Password</label>
            <input 
                v-model="form.password" 
                type="password" 
                placeholder="••••••••" 
                class="w-full px-4 py-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none text-stone-800 placeholder-stone-400 font-medium tracking-widest" 
                required 
            />
          </div>

          <div class="group relative">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 ml-1">Confirm Password</label>
            <input 
                v-model="form.confirm_password" 
                type="password" 
                placeholder="••••••••" 
                class="w-full px-4 py-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none text-stone-800 placeholder-stone-400 font-medium tracking-widest" 
                required 
            />
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full mt-6 bg-stone-900 text-white font-medium py-4 rounded-xl hover:bg-black active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-lg shadow-stone-900/20 group"
          >
            <span v-if="!loading" class="flex items-center gap-2">
                CREATE ACCOUNT
                <span class="group-hover:translate-x-1 transition-transform opacity-70">→</span>
            </span>
            <span v-else class="flex items-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </span>
          </button>

        </form>

        <div class="mt-8 text-center text-sm text-stone-500">
          Already have an account? 
          <router-link to="/login" class="text-stone-900 font-bold hover:text-amber-600 transition underline underline-offset-4 decoration-stone-300 hover:decoration-amber-600">
            Sign in here
          </router-link>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* Animations (แบบเดียวกับหน้า Login) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.animate-fade-in {
    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in-up {
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>