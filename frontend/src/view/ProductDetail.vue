<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import api from "../services/api"

const route = useRoute()

const product = ref(null)
const loading = ref(false)
const addingToCart = ref(false)
const quantity = ref(1) // ✅ เพิ่มตัวแปรเก็บจำนวนสินค้า

/* LOAD PRODUCT */
const loadProduct = async () => {
  try {
    loading.value = true
    const res = await api.get(`/products/${route.params.id}`)
    product.value = res.data
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadProduct)

/* ADD TO CART */
const addToCart = async () => {
  if (!product.value) return

  try {
    addingToCart.value = true

    // ✅ ส่ง quantity ที่ลูกค้าเลือกไปด้วย
    await api.post("/cart", {
      product_id: product.value.product_id,
      quantity: quantity.value
    })

    // จำลอง Delay นิดหน่อยให้ดู Smooth
    await new Promise(r => setTimeout(r, 500))

    alert(`เพิ่ม ${product.value.product_name} (x${quantity.value}) ลงตะกร้าแล้ว 🛒`)

  } catch (err) {
    console.log(err)
    alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า")
  } finally {
    addingToCart.value = false
  }
}

/* FORMAT CURRENCY */
const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price)
}

/* QUANTITY CONTROLS */
const increaseQty = () => quantity.value++
const decreaseQty = () => {
    if (quantity.value > 1) quantity.value--
}
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 pb-20">
    
    <div v-if="loading" class="flex h-[80vh] items-center justify-center">
        <div class="flex flex-col items-center gap-4">
            <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <p class="text-gray-400 text-sm tracking-widest uppercase">Loading Product...</p>
        </div>
    </div>

    <div v-else-if="product" class="max-w-7xl mx-auto px-6 py-12">
        
      <nav class="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <span class="hover:text-black cursor-pointer">Home</span>
        <span>/</span>
        <span class="hover:text-black cursor-pointer">{{ product.category_name }}</span>
        <span>/</span>
        <span class="text-black font-medium truncate max-w-[200px]">{{ product.product_name }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        <div class="space-y-4">
            <div class="relative aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group">
                <img
                  v-if="product.image_url"
                  :src="`http://localhost:3003${product.image_url}`"
                  class="w-full h-full object-cover object-center transition duration-700 group-hover:scale-105"
                  :alt="product.product_name"
                />
                <div class="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                    In Stock
                </div>
            </div>
        </div>

        <div class="flex flex-col pt-2">
          
          <p class="text-amber-600 font-bold text-xs uppercase tracking-widest mb-2">
            {{ product.category_name }} Series
          </p>

          <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-black leading-tight">
            {{ product.product_name }}
          </h1>

          <div class="flex items-end gap-4 mb-8 border-b border-gray-100 pb-8">
            <p class="text-3xl font-medium text-gray-900">
              {{ formatPrice(product.price) }}
            </p>
            </div>

          <div class="mb-8">
             <h3 class="font-bold text-sm uppercase text-gray-900 mb-3">Description</h3>
             <p class="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
               {{ product.description || "สัมผัสประสบการณ์ดนตรีที่เหนือกว่า ด้วยกีตาร์คุณภาพระดับพรีเมียมที่คัดสรรมาเพื่อคุณโดยเฉพาะ ดีไซน์สวยงาม เสียงกังวาน และสัมผัสที่ยอดเยี่ยม" }}
             </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 mb-10">
            
            <div class="flex items-center border border-gray-300 rounded-lg h-12 w-full sm:w-32">
                <button @click="decreaseQty" class="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-l-lg transition">-</button>
                <div class="flex-1 text-center font-medium">{{ quantity }}</div>
                <button @click="increaseQty" class="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-r-lg transition">+</button>
            </div>

            <button
              @click="addToCart"
              :disabled="addingToCart"
              class="flex-1 bg-black text-white h-12 rounded-lg font-bold uppercase tracking-wide hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <span v-if="!addingToCart">Add To Cart</span>
              <span v-else class="flex items-center gap-2">
                 <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Processing...
              </span>
            </button>
            
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-6 rounded-xl">
             <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">🚚</div>
                <span>Free Shipping</span>
             </div>
             <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">🛡️</div>
                <span>2 Year Warranty</span>
             </div>
             <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">🎸</div>
                <span>Pro Setup Included</span>
             </div>
             <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">↩️</div>
                <span>30-Day Return</span>
             </div>
          </div>

        </div>

      </div>
    </div>
    
    <div v-else class="text-center py-32">
        <h2 class="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p class="text-gray-500 mt-2">The product you are looking for does not exist.</p>
        <button @click="$router.push('/')" class="mt-6 text-amber-600 underline hover:text-amber-700">Go Back Home</button>
    </div>

  </div>
</template>