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

    cartCount.value = res.data.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

  } catch (err) {
    console.log(err)
  }
}

/* ===== ON LOAD ===== */
onMounted(() => {
  loadProducts()
  loadCartCount()
})

/* ===== LOGOUT ===== */
const logout = () => {

  localStorage.removeItem("token")
  localStorage.removeItem("user")

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

    alert("เพิ่มสินค้าแล้ว 🛒")

  } catch (err) {
    console.log(err)
    alert("เกิดข้อผิดพลาด")
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

  return [{ id: "all", name: "ทุกหมวดหมู่" }, ...unique]
})

/* ===== FILTER ===== */
const filteredProducts = computed(() => {
  return products.value.filter(item => {

    const matchSearch =
      item.product_name
        ?.toLowerCase()
        .includes(searchText.value.toLowerCase())

    const matchCategory =
      selectedCategory.value === "all" ||
      item.category_id === selectedCategory.value

    return matchSearch && matchCategory
  })
})
</script>

<template>
<div class="min-h-screen bg-[#f5f3ef]">

  <!-- Navbar -->
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

      <h1 class="text-xl font-semibold tracking-wide">
        🎸 Guitar Shop
      </h1>

      <div class="flex gap-6 text-gray-600 items-center">

        <button
          @click="$router.push('/')"
          class="hover:text-black"
        >
          Home
        </button>

        <!-- ⭐ CART BUTTON -->
        <button
          v-if="isLoggedIn"
          @click="$router.push('/cart')"
          class="relative hover:text-black"
        >
          🛒 Cart

          <span
            v-if="cartCount > 0"
            class="absolute -top-2 -right-3
                   bg-red-500 text-white text-xs
                   px-2 rounded-full"
          >
            {{ cartCount }}
          </span>
        </button>

        <button
          v-if="isLoggedIn"
          @click="logout"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg"
        >
          Logout
        </button>

        <button
          v-else
          @click="$router.push('/login')"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg"
        >
          Login
        </button>

      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="relative h-[300px] flex items-center justify-center text-white">

    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1920')"
    ></div>

    <div class="absolute inset-0 bg-black/50"></div>

    <div class="relative text-center">
      <h2 class="text-4xl font-bold mb-2">
        Find Your Perfect Guitar
      </h2>
      <p class="text-gray-200">
        เสียงดนตรีเริ่มต้นที่เครื่องดนตรีที่ใช่
      </p>
    </div>

  </section>

  <!-- FILTER -->
  <section class="max-w-7xl mx-auto px-6 pt-10">

    <div class="flex flex-col md:flex-row gap-4">

      <input
        v-model="searchText"
        type="text"
        placeholder="ค้นหากีตาร์..."
        class="border rounded-lg px-4 py-2 w-full md:w-1/2"
      />

      <select
        v-model="selectedCategory"
        class="border rounded-lg px-4 py-2 w-full md:w-1/4"
      >
        <option
          v-for="cat in categories"
          :key="cat.id"
          :value="cat.id"
        >
          {{ cat.name }}
        </option>
      </select>

    </div>

  </section>

  <!-- PRODUCT -->
  <section class="max-w-7xl mx-auto px-6 py-10">

    <h2 class="text-2xl font-semibold mb-6 text-gray-800">
      Featured Guitars
    </h2>

    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-8">

      <div
        v-for="item in filteredProducts"
        :key="item.product_id"
        class="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
      >

        <img
          v-if="item.image_url"
          :src="`http://localhost:3003${item.image_url}`"
          class="h-56 w-full object-cover hover:scale-105 transition duration-300 cursor-pointer"
          @click="goToDetail(item)"
        />

        <div class="p-4">

          <h3
            class="font-semibold text-lg cursor-pointer hover:underline"
            @click="goToDetail(item)"
          >
            {{ item.product_name }}
          </h3>

          <p class="text-gray-500 text-sm">
            {{ item.category_name }}
          </p>

          <p class="text-gray-700 mt-1 font-semibold">
            ฿ {{ Number(item.price).toLocaleString() }}
          </p>

          <button
            @click="addToCart(item)"
            class="w-full mt-4 bg-[#3b2f2f]
                   hover:bg-[#2a2121]
                   text-white py-2 rounded-lg transition"
          >
            Add to Cart
          </button>

        </div>

      </div>

    </div>

  </section>

</div>
</template>
