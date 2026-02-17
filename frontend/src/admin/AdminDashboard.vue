<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import api from "../services/api"

const router = useRouter()
const tab = ref("dashboard")

/* ======================
   CATEGORY
====================== */
const categories = ref([])
const categoryName = ref("")
const editingId = ref(null)

const loadCategories = async ()=>{
  const res = await api.get("/categories")
  categories.value = res.data
}

const saveCategory = async ()=>{

  if(!categoryName.value) return alert("กรุณากรอกชื่อหมวดหมู่")

  if(editingId.value){
    await api.put(`/categories/${editingId.value}`,{
      category_name: categoryName.value
    })
  }else{
    await api.post("/categories",{
      category_name: categoryName.value
    })
  }

  resetCategory()
  loadCategories()
}

const editCategory = (c)=>{
  editingId.value = c.category_id
  categoryName.value = c.category_name
}

const deleteCategory = async(id)=>{
  if(!confirm("ลบหมวดหมู่?")) return
  await api.delete(`/categories/${id}`)
  loadCategories()
}

const resetCategory = ()=>{
  editingId.value = null
  categoryName.value = ""
}

/* ======================
   PRODUCT
====================== */
const products = ref([])
const editingProductId = ref(null)

const productForm = ref({
  product_name:"",
  description:"",
  price:"",
  stock:"",
  category_id:"",
  image:null
})

const loadProducts = async ()=>{
  const res = await api.get("/products")
  products.value = res.data
}

const saveProduct = async ()=>{

  const formData = new FormData()

  Object.keys(productForm.value).forEach(key=>{
    if(key==="image"){
      if(productForm.value.image){
        formData.append("image", productForm.value.image)
      }
    }else{
      formData.append(key, productForm.value[key])
    }
  })

  if(editingProductId.value){
    await api.put(`/products/${editingProductId.value}`, formData)
  }else{
    await api.post("/products", formData)
  }

  resetProduct()
  loadProducts()
}

const editProduct = (p)=>{

  editingProductId.value = p.product_id

  productForm.value = {
    product_name:p.product_name,
    description:p.description,
    price:p.price,
    stock:p.stock,
    category_id:p.category_id,
    image:null
  }
}

const deleteProduct = async(id)=>{
  if(!confirm("ลบสินค้า?")) return
  await api.delete(`/products/${id}`)
  loadProducts()
}

const resetProduct = ()=>{
  editingProductId.value = null
  productForm.value = {
    product_name:"",
    description:"",
    price:"",
    stock:"",
    category_id:"",
    image:null
  }
}

/* ======================
   LOAD DATA
====================== */
onMounted(()=>{
  loadCategories()
  loadProducts()
})

/* ======================
   LOGOUT
====================== */
const logout = ()=>{
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  router.push("/login")
}
</script>

<template>
<div class="min-h-screen bg-[#f5f3ef] flex">

<!-- Sidebar -->
<aside class="w-64 bg-[#3b2f2f] text-white p-6">

<h2 class="text-2xl font-bold mb-8">
🎸 Admin Guitar
</h2>

<nav class="space-y-4">

<button @click="tab='dashboard'" class="menu-btn">
📊 Dashboard
</button>

<button @click="tab='categories'" class="menu-btn">
🏷 Category
</button>

<button @click="tab='products'" class="menu-btn">
📦 Product
</button>

<button @click="logout" class="menu-btn mt-10 bg-[#2a2121]">
🚪 Logout
</button>

</nav>
</aside>

<!-- Content -->
<main class="flex-1 p-10">

<!-- DASHBOARD -->
<div v-if="tab==='dashboard'">
<h1 class="text-3xl font-semibold mb-6">Dashboard</h1>

<div class="flex gap-6">

<div class="card">
<p>หมวดหมู่</p>
<h2>{{ categories.length }}</h2>
</div>

<div class="card">
<p>สินค้า</p>
<h2>{{ products.length }}</h2>
</div>

</div>
</div>

<!-- CATEGORY -->
<div v-if="tab==='categories'">

<h1 class="title">จัดการหมวดหมู่</h1>

<div class="box">

<div class="flex gap-3">
<input v-model="categoryName" placeholder="ชื่อหมวดหมู่" class="input"/>

<button @click="saveCategory" class="btn-primary">Save</button>

<button v-if="editingId" @click="resetCategory" class="btn-gray">
Cancel
</button>
</div>

</div>

<div class="box">

<table class="w-full">

<tr v-for="c in categories" :key="c.category_id" class="border-b">
<td>{{ c.category_id }}</td>
<td>{{ c.category_name }}</td>

<td class="space-x-3">
<button @click="editCategory(c)" class="text-yellow-600">Edit</button>
<button @click="deleteCategory(c.category_id)" class="text-red-600">Delete</button>
</td>
</tr>

</table>

</div>

</div>

<!-- PRODUCT -->
<div v-if="tab==='products'">

<h1 class="title">จัดการสินค้า</h1>

<!-- Form -->
<div class="box">

<div class="grid grid-cols-2 gap-3">

<input v-model="productForm.product_name" placeholder="ชื่อสินค้า" class="input"/>
<input v-model="productForm.price" placeholder="ราคา" class="input"/>
<input v-model="productForm.stock" placeholder="Stock" class="input"/>

<select v-model="productForm.category_id" class="input">
<option value="">เลือกหมวดหมู่</option>
<option v-for="c in categories" :key="c.category_id" :value="c.category_id">
{{ c.category_name }}
</option>
</select>

<textarea v-model="productForm.description" placeholder="รายละเอียด" class="input col-span-2"/>

<input
  type="file"
  @change="e => productForm.image = e.target.files[0]"
  class="col-span-2"
/>

</div>

<div class="mt-4 space-x-3">
<button @click="saveProduct" class="btn-primary">Save</button>
<button v-if="editingProductId" @click="resetProduct" class="btn-gray">Cancel</button>
</div>

</div>

<!-- Table -->
<div class="box">

<table class="w-full text-left">

<thead class="border-b font-semibold bg-gray-50">
<tr>
  <th class="p-2">ID</th>
  <th class="p-2">รูป</th>
  <th class="p-2">ชื่อสินค้า</th>
  <th class="p-2">รายละเอียด</th>
  <th class="p-2">ราคา</th>
  <th class="p-2">หมวดหมู่</th>
  <th class="p-2">จัดการ</th>
</tr>
</thead>

<tbody>

<tr
  v-for="p in products"
  :key="p.product_id"
  class="border-b hover:bg-gray-50"
>

<!-- ID -->
<td class="p-2">
  {{ p.product_id }}
</td>

<!-- IMAGE -->
<td class="p-2">
  <img
    v-if="p.image_url"
    :src="`http://localhost:3003${p.image_url}`"
    class="w-16 h-16 object-cover rounded"
  />
</td>

<!-- NAME -->
<td class="p-2 font-medium">
  {{ p.product_name }}
</td>

<!-- ⭐ DESCRIPTION -->
<td
  class="p-2 max-w-xs truncate text-gray-600"
  :title="p.description"
>
  {{ p.description || "-" }}
</td>

<!-- PRICE -->
<td class="p-2">
  ฿ {{ Number(p.price).toLocaleString() }}
</td>

<!-- CATEGORY -->
<td class="p-2">
  {{ p.category_name || "-" }}
</td>

<!-- ACTION -->
<td class="p-2 space-x-2">
  <button
    @click="editProduct(p)"
    class="text-yellow-600 hover:underline"
  >
    Edit
  </button>

  <button
    @click="deleteProduct(p.product_id)"
    class="text-red-600 hover:underline"
  >
    Delete
  </button>
</td>

</tr>

</tbody>
</table>

</div>


</div>

</main>
</div>
</template>

<style scoped>
.menu-btn{
  width:100%;
  text-align:left;
  padding:10px;
  border-radius:8px;
  transition:0.2s;
}

.menu-btn:hover{
  background:#2a2121;
}

.title{
  font-size:24px;
  font-weight:600;
  margin-bottom:20px;
}

.box{
  background:white;
  padding:20px;
  border-radius:12px;
  box-shadow:0 2px 10px rgba(0,0,0,0.05);
  margin-bottom:20px;
}

.card{
  background:white;
  padding:20px;
  border-radius:12px;
  width:200px;
  box-shadow:0 2px 10px rgba(0,0,0,0.05);
}

.card h2{
  font-size:28px;
  font-weight:bold;
  color:#3b2f2f;
}

.input{
  border:1px solid #e5e7eb;
  padding:10px;
  border-radius:8px;
  width:100%;
}

.btn-primary{
  background:#3b2f2f;
  color:white;
  padding:8px 16px;
  border-radius:8px;
}

.btn-primary:hover{
  background:#2a2121;
}

.btn-gray{
  background:#e5e7eb;
  padding:8px 16px;
  border-radius:8px;
}
</style>  