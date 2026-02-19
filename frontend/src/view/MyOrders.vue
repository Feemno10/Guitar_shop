<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import api from "../services/api"

const router = useRouter()
const orders = ref([])
const loading = ref(true)

const loadOrders = async () => {
  try {
    loading.value = true
    const res = await api.get("/orders/my-orders")
    
    // ✅ จุดที่แก้ไข: กรองเอาเฉพาะออเดอร์ที่สถานะ "ไม่ใช่" completed มาแสดง
    orders.value = res.data.filter(order => order.status !== 'completed')
    
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)

const statusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatPrice = (price) => new Intl.NumberFormat('th-TH').format(price)
</script>

<template>
<div class="min-h-screen bg-gray-50 py-12 font-sans text-gray-900">
  <div class="max-w-5xl mx-auto px-6">

    <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold tracking-tight">My Orders</h1>
        <button @click="router.push('/')" class="text-gray-500 hover:text-black text-sm">Back to Shop</button>
    </div>

    <div v-if="!loading && orders.length === 0" class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="text-6xl mb-4 opacity-50 grayscale">📦</div>
        <h2 class="text-xl font-bold text-gray-900">No active orders</h2>
        <p class="text-gray-500 mt-2">You don't have any pending orders at the moment.</p>
        <button @click="router.push('/')" class="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 shadow-lg">Shop Now</button>
    </div>

    <div v-else class="space-y-4">
        <div 
          v-for="order in orders" 
          :key="order.order_id" 
          @click="router.push(`/orders/${order.order_id}`)"
          class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-black/20 transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl border border-gray-200">🛍️</div>
                <div>
                    <h2 class="font-bold text-lg">Order #{{ order.order_id }}</h2>
                    <p class="text-sm text-gray-500">{{ formatDate(order.created_at) }}</p>
                </div>
            </div>

            <div class="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <span :class="`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${statusColor(order.status)}`">
                    {{ order.status }}
                </span>
                
                <div class="text-right min-w-[100px]">
                    <p class="text-[10px] text-gray-400 uppercase tracking-widest">Total</p>
                    <p class="font-bold text-lg">฿ {{ formatPrice(order.total_price) }}</p>
                </div>

                <div class="text-gray-300 font-bold">→</div>
            </div>
        </div>
    </div>

  </div>
</div>
</template>