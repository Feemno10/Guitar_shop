<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import api from "../services/api"

const router = useRouter()

/* ===== STATE ===== */
const products = ref([])
const cartCount = ref(0)
const searchText = ref("")
const selectedCategory = ref("all")
const isScrolled = ref(false)

/* ===== Login ===== */
const loggedIn = ref(!!localStorage.getItem("token"))
const isLoggedIn = computed(() => loggedIn.value)

/* ===== LOAD PRODUCTS ===== */
const loadProducts = async () => {
  try {
    const res = await api.get("/products")
    products.value = res.data.map(p => ({
      ...p,
      category_name: p.category_name?.trim()
    }))
  } catch (err) {
    console.log(err)
  }
}

/* ===== LOAD CART COUNT ===== */
const loadCartCount = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await api.get("/cart")
    cartCount.value = res.data.reduce((sum, item) => sum + item.quantity, 0)
  } catch (err) {
    console.log(err)
  }
}

/* ===== ON LOAD ===== */
onMounted(() => {
  loadProducts()
  loadCartCount()
  window.addEventListener('scroll', handleScroll)
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

/* ===== LOGOUT ===== */
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("role")
  loggedIn.value = false
  cartCount.value = 0
  router.replace("/")
}

/* ===== GO DETAIL ===== */
const goToDetail = (product) => {
  router.push(`/product/${product.product_id}`)
}

/* ===== ADD TO CART ===== */
const addToCart = async (product) => {
  if (!isLoggedIn.value) {
    router.push("/login")
    return
  }
  try {
    await api.post("/cart", {
      product_id: product.product_id,
      quantity: 1
    })
    await loadCartCount()
    alert(`เพิ่ม ${product.product_name} ลงตะกร้าเรียบร้อย 🛒`)
  } catch (err) {
    console.log(err)
    alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า")
  }
}

/* ===== CATEGORY ===== */
const categories = computed(() => {
  const cats = products.value.map(p => ({
    id: p.category_id,
    name: p.category_name
  }))
  const unique = []
  cats.forEach(c => {
    if (!unique.find(u => u.id === c.id)) {
      unique.push(c)
    }
  })
  return [{ id: "all", name: "All Collections" }, ...unique]
})

/* ===== FILTER ===== */
const filteredProducts = computed(() => {
  return products.value.filter(item => {
    const matchSearch = item.product_name?.toLowerCase().includes(searchText.value.toLowerCase())
    const matchCategory = selectedCategory.value === "all" || item.category_id === selectedCategory.value
    return matchSearch && matchCategory
  })
})

/* ===== HELPER: CURRENCY ===== */
const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price)
}
</script>

<template>
<div class="min-h-screen bg-[#fafaf9] font-sans text-stone-800 selection:bg-amber-500 selection:text-white pb-20">

  <nav 
    class="fixed top-0 w-full z-50 transition-all duration-500"
    :class="isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-gradient-to-b from-black/60 to-transparent py-6'"
  >
    <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
      
      <h1 
        class="text-2xl font-bold tracking-widest cursor-pointer flex items-center gap-2 transition-colors duration-300"
        @click="$router.push('/')"
        :class="isScrolled ? 'text-stone-900' : 'text-white'"
      >
        <span>🎸</span> FEEM<span class="text-amber-500 font-light">GUITAR</span>
      </h1>

      <div class="flex items-center gap-5 md:gap-8">
        
        <button 
          v-if="isLoggedIn" 
          @click="$router.push('/cart')" 
          class="relative group transition-colors duration-300 flex items-center gap-2"
          :class="isScrolled ? 'text-stone-600 hover:text-amber-600' : 'text-stone-200 hover:text-white'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span class="hidden md:block text-sm font-medium tracking-wider uppercase">Cart</span>
          
          <span v-if="cartCount > 0" class="absolute -top-2 -right-3 md:right-10 bg-amber-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm shadow-amber-500/50">
            {{ cartCount }}
          </span>
        </button>

        <template v-if="!isLoggedIn">
           <button 
            @click="$router.push('/login')" 
            class="px-6 py-2 text-sm font-bold uppercase tracking-widest transition-all rounded-full border-2"
            :class="isScrolled ? 'border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white' : 'border-white text-white hover:bg-white hover:text-black'"
           >
             Sign In
           </button>
        </template>
        
        <template v-else>
           <button 
             @click="$router.push('/orders')"
             class="hidden md:block text-sm font-medium tracking-wider uppercase transition-colors"
             :class="isScrolled ? 'text-stone-600 hover:text-amber-600' : 'text-stone-300 hover:text-white'"
           >
             My Orders
           </button>
           
           <button 
             @click="logout"
             class="text-sm font-medium hover:underline underline-offset-4 decoration-amber-500 transition-colors uppercase tracking-wider"
             :class="isScrolled ? 'text-stone-500 hover:text-stone-900' : 'text-stone-300 hover:text-white'"
           >
             Logout
           </button>
        </template>
      </div>
    </div>
  </nav>

  <section class="relative h-[75vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 z-0 bg-black">
        <img src="https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=2000&auto=format&fit=crop" 
             class="w-full h-full object-cover opacity-50 scale-105 animate-slow-zoom" />
    </div>
    
    <div class="absolute inset-0 bg-gradient-to-t from-[#fafaf9] via-transparent to-transparent z-0"></div>

    <div class="relative z-10 text-center text-white px-4 animate-fade-in-up mt-20">
      <p class="text-amber-500 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-bold">Premium Instruments</p>
      <h2 class="text-5xl md:text-7xl font-serif font-medium mb-6 tracking-tight drop-shadow-lg">
        Master Your Sound
      </h2>
      <div class="w-16 h-0.5 bg-amber-500 mx-auto mb-8"></div>
      <p class="text-stone-200 max-w-lg mx-auto mb-10 text-lg md:text-xl font-light tracking-wide drop-shadow-md">
        ค้นพบกีตาร์ระดับโลกที่คัดสรรมาเพื่อศิลปินตัวจริง สัมผัสประสบการณ์ดนตรีที่เหนือกว่า
      </p>
      <button 
        @click="() => { document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth'}) }"
        class="bg-white text-stone-900 px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-amber-400 hover:text-white transition duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
      >
        Explore Collection
      </button>
    </div>
  </section>

  <section id="shop-section" class="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
    
    <div class="text-center mb-12">
        <h2 class="text-3xl font-serif font-medium text-stone-900 mb-3">Featured Guitars</h2>
        <p class="text-stone-500 font-light">Select the perfect companion for your musical journey.</p>
    </div>

    <div class="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
      
      <div class="flex flex-wrap gap-2 justify-center md:justify-start overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          @click="selectedCategory = cat.id"
          class="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border"
          :class="selectedCategory === cat.id 
            ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
            : 'bg-stone-50 text-stone-500 border-transparent hover:bg-stone-100 hover:text-stone-800'"
        >
          {{ cat.name }}
        </button>
      </div>

      <div class="relative w-full md:w-72 shrink-0">
        <input 
          v-model="searchText"
          type="text" 
          placeholder="Search models..." 
          class="w-full pl-12 pr-4 py-3 bg-stone-50 border border-transparent focus:border-amber-500 focus:bg-white rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all text-stone-800 placeholder-stone-400"
        />
        <svg class="w-5 h-5 text-stone-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

    </div>

    <div v-if="filteredProducts.length === 0" class="text-center py-24 bg-white rounded-3xl border border-stone-100 shadow-sm">
        <div class="text-6xl mb-4 grayscale opacity-20">🎸</div>
        <h3 class="text-xl font-bold text-stone-800 mb-2">No instruments found</h3>
        <p class="text-stone-500 font-light">Try adjusting your search or filter criteria.</p>
        <button @click="searchText=''; selectedCategory='all'" class="mt-6 text-amber-600 font-medium hover:underline underline-offset-4">Clear all filters</button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
      
      <div 
        v-for="item in filteredProducts" 
        :key="item.product_id"
        class="group cursor-pointer flex flex-col"
        @click="goToDetail(item)"
      >
        <div class="relative aspect-[4/5] bg-stone-100 rounded-2xl overflow-hidden mb-5 shadow-sm border border-stone-200/60 transition-all duration-500 group-hover:shadow-xl group-hover:border-transparent">
            
            <img 
              v-if="item.image_url"
              :src="`http://localhost:3003${item.image_url}`" 
              class="w-full h-full object-cover object-center transition duration-700 ease-in-out group-hover:scale-110"
              :alt="item.product_name"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-stone-300">No Image</div>

            <div class="absolute inset-x-0 bottom-0 p-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
                 <button 
                    @click.stop="addToCart(item)"
                    class="w-full bg-white text-stone-900 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-400 hover:text-white transition-colors duration-300 shadow-lg flex items-center justify-center gap-2"
                 >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    Add to Cart
                 </button>
            </div>
        </div>

        <div class="flex flex-col flex-1 px-1">
            <p class="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-1.5">{{ item.category_name }}</p>
            <h3 class="text-base font-bold text-stone-800 leading-tight group-hover:text-amber-600 transition-colors line-clamp-2 mb-2">
                {{ item.product_name }}
            </h3>
            <p class="mt-auto font-medium text-stone-500">
                {{ formatPrice(item.price) }}
            </p>
        </div>
      </div>

    </div>
  </section>

  <footer class="bg-[#0f172a] text-white py-16 border-t border-stone-800 mt-10">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div class="text-center md:text-left">
              <h4 class="text-2xl font-bold tracking-widest mb-2">FEEM<span class="text-amber-500 font-light">GUITAR</span></h4>
              <p class="text-stone-400 text-sm font-light max-w-xs">Elevating your musical journey with premium instruments and exceptional service.</p>
          </div>
          
          <div class="flex flex-col items-center md:items-end gap-4">
            <div class="flex gap-6 text-sm text-stone-400 font-medium tracking-wide">
                <a href="#" class="hover:text-amber-500 transition">Instagram</a>
                <a href="#" class="hover:text-amber-500 transition">Facebook</a>
                <a href="#" class="hover:text-amber-500 transition">Line</a>
            </div>
            <p class="text-stone-600 text-xs mt-2 font-light">© 2024 All rights reserved.</p>
          </div>
      </div>
  </footer>

</div>
</template>

<style scoped>
/* ซ่อน Scrollbar ของแถบหมวดหมู่ในมือถือ */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slowZoom {
  from { transform: scale(1.05); }
  to { transform: scale(1.15); }
}
.animate-slow-zoom {
  animation: slowZoom 20s alternate infinite ease-in-out;
}
</style>