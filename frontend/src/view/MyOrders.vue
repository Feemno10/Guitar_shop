<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import api from "../services/api"

const router = useRouter()
const orders = ref([])

const loadOrders = async () => {
  try {
    const res = await api.get("/orders/my-orders")
    orders.value = res.data
  } catch (err) {
    console.log(err)
  }
}

onMounted(loadOrders)

const goDetail = (id) => {
  router.push(`/orders/${id}`)
}
</script>

<template>
<div class="max-w-5xl mx-auto p-10">

<h1 class="text-3xl font-bold mb-6">
📦 คำสั่งซื้อของฉัน
</h1>

<div v-if="orders.length === 0">
ยังไม่มีคำสั่งซื้อ
</div>

<div v-else>

<div
  v-for="order in orders"
  :key="order.order_id"
  class="border-b py-4 cursor-pointer hover:bg-gray-50"
  @click="goDetail(order.order_id)"
>

<h2 class="font-semibold">
Order #{{ order.order_id }}
</h2>

<p>สถานะ: {{ order.status }}</p>

<p>
ยอดรวม:
฿ {{ Number(order.total_price).toLocaleString() }}
</p>

</div>

</div>

</div>
</template>
