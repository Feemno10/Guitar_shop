<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import api from "../services/api"

const route = useRoute()
const router = useRouter()

const items = ref([])
const order = ref(null)

/* ======================
   LOAD ORDER DETAIL
====================== */
const loadDetail = async () => {
  try {
    const res = await api.get(`/orders/${route.params.id}`)
    items.value = res.data
  } catch (err) {
    console.log(err)
  }
}

onMounted(loadDetail)

/* ======================
   TOTAL PRICE
====================== */
const totalPrice = computed(() => {
  return items.value.reduce(
    (sum, item) => sum + Number(item.total_price),
    0
  )
})

/* ======================
   GO HOME
====================== */
const goHome = () => {
  router.push("/")
}
</script>

<template>
<div class="max-w-5xl mx-auto p-10">

<!-- 🔥 ปุ่มกลับ -->
<button
  @click="goHome"
  class="mb-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
>
← กลับหน้าหลัก
</button>

<h1 class="text-3xl font-bold mb-8">
📦 รายละเอียดคำสั่งซื้อ
</h1>

<!-- EMPTY -->
<div v-if="items.length === 0">
ไม่พบข้อมูลคำสั่งซื้อ
</div>

<!-- ORDER ITEMS -->
<div v-else>

<div
  v-for="item in items"
  :key="item.order_item_id"
  class="flex items-center gap-6 border-b py-4"
>

<img
  :src="`http://localhost:3003${item.image_url}`"
  class="w-24 h-24 object-cover rounded"
/>

<div class="flex-1">

<h2 class="font-semibold text-lg">
{{ item.product_name }}
</h2>

<p class="text-gray-500">
จำนวน: {{ item.quantity }}
</p>

<p class="text-gray-500">
ราคา: ฿ {{ Number(item.price).toLocaleString() }}
</p>

</div>

<div class="font-semibold text-lg">
฿ {{ Number(item.total_price).toLocaleString() }}
</div>

</div>

<!-- TOTAL -->
<div class="text-right mt-8">

<h2 class="text-2xl font-bold">
รวมทั้งหมด : ฿ {{ totalPrice.toLocaleString() }}
</h2>

</div>

</div>

</div>
</template>
