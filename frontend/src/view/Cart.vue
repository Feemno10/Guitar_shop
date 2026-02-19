<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import api from "../services/api"

const router = useRouter()
const cart = ref([])
const loading = ref(false)
const checkingOut = ref(false)

const loadCart = async () => {
  try {
    loading.value = true
    const res = await api.get("/cart")
    if (Array.isArray(res.data)) cart.value = res.data
    else if (res.data && Object.keys(res.data).length > 0) cart.value = [res.data]
    else cart.value = []
  } catch (err) {
    console.log(err)
    cart.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadCart)

const changeQty = async (item, newQty) => {
  if (newQty < 1) return
  const oldQty = item.quantity
  item.quantity = newQty
  try {
    await api.put(`/cart/${item.cart_id}`, { quantity: newQty })
  } catch (err) {
    item.quantity = oldQty
    alert("ไม่สามารถอัปเดตจำนวนสินค้าได้")
  }
}

const removeItem = async (id) => {
  if (!confirm("ต้องการนำสินค้านี้ออกจากตะกร้า?")) return
  try {
      await api.delete(`/cart/${id}`)
      await loadCart()
  } catch(err) {
      alert("ลบสินค้าไม่สำเร็จ")
  }
}

const checkout = async () => {
  if (cart.value.length === 0) return alert("ตะกร้าว่างเปล่า")
  try {
    checkingOut.value = true
    const res = await api.post("/orders/checkout")
    
    // เด้งไปหน้า Order Detail (ใบเสร็จ) 
    router.push(`/orders/${res.data.order_id}`)
  } catch (err) {
    alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการสั่งซื้อ")
  } finally {
    checkingOut.value = false
  }
}

const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0))
const formatPrice = (price) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price)
</script>

<template>
<div class="min-h-screen bg-stone-50 text-slate-800 font-sans pb-20">

  <div class="bg-white border-b border-gray-100 pt-10 pb-8 shadow-sm">
    <div class="max-w-7xl mx-auto px-6">
        <h1 class="text-3xl md:text-4xl font-serif font-medium tracking-tight mb-2 text-gray-900">Shopping Bag</h1>
        <p class="text-gray-500 text-sm tracking-wide">คุณมีสินค้า {{ cart.length }} รายการในตะกร้า</p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-6 mt-10">
    <div v-if="cart.length === 0 && !loading" class="text-center py-24 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="mb-6 text-6xl opacity-10 grayscale">🎸</div>
        <h2 class="text-2xl font-serif font-medium mb-3 text-gray-900">Your bag is empty</h2>
        <p class="text-gray-500 mb-8 font-light">ยังไม่มีเครื่องดนตรีชิ้นโปรดในตะกร้าของคุณ</p>
        <button @click="router.push('/')" class="bg-black text-white px-8 py-3 rounded-full hover:bg-stone-800 transition shadow-lg">Browse Collection</button>
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-12">
      <div class="flex-1">
        <div class="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-widest">
            <div class="col-span-6">Instrument</div>
            <div class="col-span-2 text-center">Quantity</div>
            <div class="col-span-2 text-right">Price</div>
            <div class="col-span-2 text-right">Total</div>
        </div>

        <div class="space-y-6 md:space-y-0">
            <div v-for="item in cart" :key="item.cart_id" class="flex flex-col md:grid md:grid-cols-12 gap-6 items-center py-6 border-b border-gray-100 last:border-0">
                <div class="col-span-6 w-full flex gap-5 items-start">
                    <div class="w-24 aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden shrink-0 shadow-sm group cursor-pointer" @click="router.push(`/product/${item.product_id}`)">
                        <img v-if="item.image_url" :src="`http://localhost:3003${item.image_url}`" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                    </div>
                    <div class="pt-1">
                        <h3 class="font-medium text-lg text-gray-900 cursor-pointer hover:underline" @click="router.push(`/product/${item.product_id}`)">{{ item.product_name }}</h3>
                        <p class="text-xs text-gray-400 mt-1 mb-3">Ref: {{ item.cart_id }}</p>
                        <button @click="removeItem(item.cart_id)" class="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"><span class="text-lg leading-none">×</span> Remove</button>
                    </div>
                </div>

                <div class="col-span-2 flex justify-center w-full md:w-auto">
                    <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <button @click="changeQty(item, item.quantity - 1)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-500" :disabled="item.quantity <= 1">-</button>
                        <span class="w-10 text-center text-sm font-medium text-gray-900">{{ item.quantity }}</span>
                        <button @click="changeQty(item, item.quantity + 1)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-500">+</button>
                    </div>
                </div>

                <div class="col-span-2 text-right hidden md:block text-gray-500 text-sm font-light">{{ formatPrice(item.price) }}</div>
                <div class="col-span-2 w-full md:w-auto flex justify-between md:block md:text-right font-medium text-gray-900">
                    <span class="md:hidden text-gray-500 text-sm">Total:</span> {{ formatPrice(item.price * item.quantity) }}
                </div>
            </div>
        </div>
      </div>

      <div class="w-full lg:w-[380px] shrink-0">
          <div class="bg-white p-8 rounded-xl sticky top-28 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h2 class="text-xl font-serif font-medium mb-6">Order Summary</h2>
              <div class="space-y-4 mb-6 text-sm">
                  <div class="flex justify-between text-gray-600"><span>Subtotal</span><span class="font-medium text-gray-900">{{ formatPrice(totalPrice) }}</span></div>
                  <div class="flex justify-between text-gray-600"><span>Shipping</span><span class="text-emerald-600 font-medium">Free Express</span></div>
                  <div class="flex justify-between text-gray-600"><span>Tax (included)</span><span>฿ 0.00</span></div>
              </div>
              <div class="h-px bg-gray-100 w-full mb-6"></div>
              <div class="flex justify-between text-2xl font-serif font-medium text-gray-900 mb-8"><span>Total</span><span>{{ formatPrice(totalPrice) }}</span></div>

              <button @click="checkout" :disabled="checkingOut || cart.length === 0" class="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-stone-800 transition-all active:scale-[0.98] shadow-lg flex justify-center items-center gap-2 group disabled:opacity-50">
                  <span v-if="checkingOut">Processing...</span>
                  <span v-else class="flex items-center gap-2">Proceed to Checkout <span class="group-hover:translate-x-1 transition-transform">→</span></span>
              </button>

              <p class="text-[10px] text-center text-gray-400 mt-6">Secure Checkout - SSL Encrypted. <br>Prices include VAT.</p>
          </div>
      </div>
    </div>
  </div>
</div>
</template>