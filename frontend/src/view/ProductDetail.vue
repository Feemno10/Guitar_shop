<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import api from "../services/api"

const route = useRoute()

const product = ref(null)
const loading = ref(false)

/* LOAD PRODUCT */
const loadProduct = async () => {
  try {
    const res = await api.get(`/products/${route.params.id}`)
    product.value = res.data
  } catch (err) {
    console.log(err)
  }
}

onMounted(loadProduct)

/* ADD TO CART */
const addToCart = async () => {
  try {

    loading.value = true

    await api.post("/cart", {
      product_id: product.value.product_id,
      quantity: 1
    })

    alert("เพิ่มสินค้าเข้าตะกร้าแล้ว 🛒")

  } catch (err) {
    console.log(err)
    alert("เพิ่มสินค้าไม่สำเร็จ")
  } finally {
    loading.value = false
  }
}
</script>

<template>

<div v-if="product" class="max-w-5xl mx-auto p-10">

  <div class="grid md:grid-cols-2 gap-10">

    <!-- IMAGE -->
    <img
      :src="`http://localhost:3003${product.image_url}`"
      class="rounded-xl shadow"
    />

    <!-- INFO -->
    <div>

      <!-- NAME -->
      <h1 class="text-3xl font-bold">
        {{ product.product_name }}
      </h1>

      <!-- CATEGORY -->
      <p class="text-gray-500 mt-1">
        {{ product.category_name }}
      </p>

      <!-- PRICE -->
      <p class="text-2xl font-semibold mt-4 text-green-700">
        ฿ {{ Number(product.price).toLocaleString() }}
      </p>

      <!-- ⭐ DESCRIPTION -->
      <div class="mt-6">
        <h3 class="font-semibold text-lg mb-2">
          รายละเอียดสินค้า
        </h3>

        <p class="text-gray-600 leading-relaxed whitespace-pre-line">
          {{ product.description || "ไม่มีรายละเอียด" }}
        </p>
      </div>

      <!-- BUTTON -->
      <button
        @click="addToCart"
        :disabled="loading"
        class="mt-8 bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
      >
        {{ loading ? "กำลังเพิ่ม..." : "Add To Cart 🛒" }}
      </button>

    </div>

  </div>

</div>

<!-- LOADING -->
<div v-else class="text-center p-20 text-gray-400">
  Loading...
</div>

</template>
