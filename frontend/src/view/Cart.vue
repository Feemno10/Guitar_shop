<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import api from "../services/api"

const router = useRouter()
const cart = ref([])

/* LOAD CART */
const loadCart = async () => {
  try {
    const res = await api.get("/cart")

    if (Array.isArray(res.data)) {
      cart.value = res.data
    } else if (res.data && Object.keys(res.data).length > 0) {
      cart.value = [res.data]
    } else {
      cart.value = []
    }

  } catch (err) {
    console.log(err)
    cart.value = []
  }
}

onMounted(loadCart)

/* CHANGE QTY */
const changeQty = async (item, qty) => {
  if (qty < 1) return

  await api.put(`/cart/${item.cart_id}`, {
    quantity: qty
  })

  loadCart()
}

/* REMOVE ITEM */
const removeItem = async (id) => {
  await api.delete(`/cart/${id}`)
  loadCart()
}

/* CLEAR CART */
const clearCart = async () => {
  if (!confirm("ล้างตะกร้า ?")) return

  await api.delete("/cart")
  loadCart()
}

/* CHECKOUT */
const checkout = async () => {
  if (!confirm("ยืนยันการสั่งซื้อ ?")) return

  try {
    const res = await api.post("/orders/checkout")

    alert("สั่งซื้อสำเร็จ")

    router.push(`/orders/${res.data.order_id}`)

  } catch (err) {
    alert(err.response?.data?.message || "Checkout Error")
  }
}

/* TOTAL PRICE */
const totalPrice = computed(() => {
  return cart.value.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )
})
</script>

<template>
<div class="max-w-5xl mx-auto p-10">

<h1 class="text-3xl font-bold mb-6">
🛒 ตะกร้าสินค้า
</h1>

<div v-if="cart.length === 0">
ไม่มีสินค้าในตะกร้า
</div>

<div v-else>

<div
  v-for="item in cart"
  :key="item.cart_id"
  class="flex items-center gap-6 border-b py-4"
>

<img
  :src="`http://localhost:3003${item.image_url}`"
  class="w-24 h-24 object-cover rounded"
/>

<div class="flex-1">
<h2 class="font-semibold">
{{ item.product_name }}
</h2>

<p>฿ {{ Number(item.price).toLocaleString() }}</p>
</div>

<div class="flex items-center gap-2">

<button
  @click="changeQty(item, item.quantity - 1)"
  class="px-3 bg-gray-200 rounded"
>
-
</button>

<span>{{ item.quantity }}</span>

<button
  @click="changeQty(item, item.quantity + 1)"
  class="px-3 bg-gray-200 rounded"
>
+
</button>

</div>

<div class="w-24 text-right">
฿ {{ Number(item.price * item.quantity).toLocaleString() }}
</div>

<button
  @click="removeItem(item.cart_id)"
  class="text-red-500"
>
ลบ
</button>

</div>

<!-- TOTAL -->
<div class="text-right mt-6">

<h2 class="text-xl font-bold">
รวมทั้งหมด: ฿ {{ totalPrice.toLocaleString() }}
</h2>

<div class="flex justify-end gap-3 mt-4">

<button
  @click="clearCart"
  class="bg-red-500 text-white px-6 py-2 rounded"
>
ล้างตะกร้า
</button>

<button
  @click="checkout"
  class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
>
สั่งซื้อสินค้า
</button>

</div>

</div>

</div>

</div>
</template>