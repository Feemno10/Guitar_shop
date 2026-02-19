<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import api from "../services/api"

const router = useRouter()
const tab = ref("dashboard")

/* ======================
   STATE
====================== */
const categories = ref([])
const products = ref([])
const orders = ref([]) 
const loading = ref(false)

// Forms & Modals
const categoryForm = ref({ id: null, name: "" })
const productForm = ref({
  id: null,
  product_name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  image: null,
  image_preview: null
})

// Order Detail Modal State
const showOrderModal = ref(false)
const selectedOrder = ref(null)
const orderItems = ref([])
const modalLoading = ref(false)

/* ======================
   LOAD DATA
====================== */
const loadData = async () => {
  loading.value = true
  try {
    const [catRes, prodRes, orderRes] = await Promise.all([
      api.get("/categories"),
      api.get("/products"),
      api.get("/orders") 
    ])
    categories.value = catRes.data
    products.value = prodRes.data
    
    // กรองเอาเฉพาะออเดอร์ที่ "ยังไม่เสร็จ" 
    orders.value = orderRes.data.filter(o => o.status !== 'completed')

  } catch (err) {
    console.error("Failed to load data", err)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

/* ======================
   ORDER ACTIONS
====================== */
const viewOrder = async (order) => {
    selectedOrder.value = order
    showOrderModal.value = true
    modalLoading.value = true
    try {
        const res = await api.get(`/orders/${order.order_id}`)
        orderItems.value = res.data.items 
    } catch (err) {
        alert("ไม่สามารถโหลดรายละเอียดออเดอร์ได้")
    } finally {
        modalLoading.value = false
    }
}

const updateOrderStatus = async (status) => {
    if(!selectedOrder.value) return
    
    if(!confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${status.toUpperCase()}?`)) return

    try {
        await api.put(`/orders/${selectedOrder.value.order_id}/status`, { status })
        
        if (status === 'completed') {
            orders.value = orders.value.filter(o => o.order_id !== selectedOrder.value.order_id)
            showOrderModal.value = false 
            alert(`ออเดอร์เสร็จสมบูรณ์และถูกย้ายออกจากรายการแล้ว`)
        } else {
            selectedOrder.value.status = status
            const index = orders.value.findIndex(o => o.order_id === selectedOrder.value.order_id)
            if(index !== -1) orders.value[index].status = status
            alert(`อัปเดตสถานะเรียบร้อย`)
            showOrderModal.value = false 
        }
        
    } catch (err) {
        alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ")
    }
}

const statusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

/* ======================
   CATEGORY ACTIONS
====================== */
const saveCategory = async () => {
  if (!categoryForm.value.name) return alert("กรุณากรอกชื่อหมวดหมู่")
  try {
    if (categoryForm.value.id) {
      await api.put(`/categories/${categoryForm.value.id}`, { category_name: categoryForm.value.name })
    } else {
      await api.post("/categories", { category_name: categoryForm.value.name })
    }
    categoryForm.value = { id: null, name: "" }
    loadData()
  } catch (err) {
    alert("Error saving category")
  }
}

const editCategory = (c) => {
  categoryForm.value = { id: c.category_id, name: c.category_name }
}

const deleteCategory = async (id) => {
  if (!confirm("ยืนยันการลบหมวดหมู่?")) return
  await api.delete(`/categories/${id}`)
  loadData()
}

/* ======================
   PRODUCT ACTIONS
====================== */
const saveProduct = async () => {
  const formData = new FormData()
  Object.keys(productForm.value).forEach(key => {
     if (key === 'image' && productForm.value.image) {
        formData.append('image', productForm.value.image)
     } else if (key !== 'image' && key !== 'image_preview' && key !== 'id') {
        formData.append(key, productForm.value[key])
     }
  })

  try {
    if (productForm.value.id) {
      await api.put(`/products/${productForm.value.id}`, formData)
    } else {
      await api.post("/products", formData)
    }
    resetProductForm()
    loadData()
  } catch (err) {
    alert("Error saving product")
  }
}

const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
        productForm.value.image = file
        productForm.value.image_preview = URL.createObjectURL(file)
    }
}

const editProduct = (p) => {
  productForm.value = {
    id: p.product_id,
    product_name: p.product_name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category_id: p.category_id,
    image: null,
    image_preview: p.image_url ? `http://localhost:3003${p.image_url}` : null
  }
  tab.value = 'products_form'
}

const deleteProduct = async (id) => {
  if (!confirm("ยืนยันการลบสินค้า?")) return
  await api.delete(`/products/${id}`)
  loadData()
}

const resetProductForm = () => {
  productForm.value = { id: null, product_name: "", description: "", price: "", stock: "", category_id: "", image: null, image_preview: null }
}

const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  router.push("/login")
}

// Helpers
const formatPrice = (p) => {
    if(!p || isNaN(p)) return '0.00'
    return new Intl.NumberFormat('th-TH').format(p)
}
const formatDate = (dateString) => {
    if(!dateString) return '-'
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
}
</script>

<template>
<div class="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-amber-500 selection:text-white">

  <aside class="w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl z-30 relative">
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="h-24 flex items-center px-8 border-b border-white/5 relative z-10">
      <h1 class="text-2xl font-bold tracking-widest text-white">FEEM<span class="text-amber-500 font-light">ADMIN</span></h1>
    </div>

    <nav class="flex-1 px-4 py-8 space-y-2 relative z-10">
      <button @click="tab='dashboard'" class="w-full flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium tracking-wide"
        :class="tab === 'dashboard' ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border-l-2 border-amber-500 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:text-white hover:bg-white/5'">
        <span class="text-xl" :class="tab==='dashboard'?'opacity-100':'opacity-60'">📊</span> Dashboard
      </button>

      <button @click="tab='orders'" class="w-full flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium tracking-wide"
        :class="tab === 'orders' ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border-l-2 border-amber-500' : 'text-slate-400 hover:text-white hover:bg-white/5'">
        <span class="text-xl" :class="tab==='orders'?'opacity-100':'opacity-60'">🛍️</span> Orders
        <span v-if="orders.length > 0" class="ml-auto bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg shadow-amber-500/30">{{ orders.length }}</span>
      </button>

      <button @click="tab='products' || tab==='products_form'" class="w-full flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium tracking-wide"
        :class="tab === 'products' || tab === 'products_form' ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border-l-2 border-amber-500' : 'text-slate-400 hover:text-white hover:bg-white/5'">
        <span class="text-xl" :class="(tab === 'products' || tab === 'products_form')?'opacity-100':'opacity-60'">📦</span> Products
      </button>

      <button @click="tab='categories'" class="w-full flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium tracking-wide"
        :class="tab === 'categories' ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border-l-2 border-amber-500' : 'text-slate-400 hover:text-white hover:bg-white/5'">
        <span class="text-xl" :class="tab==='categories'?'opacity-100':'opacity-60'">🏷️</span> Categories
      </button>
    </nav>

    <div class="p-6 border-t border-white/5 relative z-10">
      <button @click="logout" class="flex items-center gap-3 text-slate-400 hover:text-rose-400 transition-colors w-full px-4 py-2 text-sm font-medium">
        <span>🚪</span> Sign Out
      </button>
    </div>
  </aside>

  <main class="flex-1 overflow-y-auto relative bg-slate-50/50">
    
    <header class="h-20 bg-white/70 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20 shadow-sm">
      <h2 class="text-xl font-bold text-slate-800 capitalize tracking-wide">{{ tab.replace('_', ' ') }}</h2>
      <div class="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition">
        <div class="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
             <img src="https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff" />
        </div>
        <span class="text-sm font-semibold text-slate-700">Administrator</span>
      </div>
    </header>

    <div class="p-10 max-w-7xl mx-auto">
      
      <div v-if="tab==='dashboard'" class="space-y-8 animate-fade-in">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="relative bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(245,158,11,0.1)] transition-all duration-300 overflow-hidden group cursor-default">
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
            <div class="flex justify-between items-start relative z-10">
                <div>
                    <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Pending Orders</p>
                    <h3 class="text-4xl font-black text-slate-800">{{ orders.length }}</h3>
                </div>
                <div class="p-4 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-2xl shadow-sm text-2xl">🛍️</div>
            </div>
          </div>

          <div class="relative bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] transition-all duration-300 overflow-hidden group cursor-default">
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            <div class="flex justify-between items-start relative z-10">
                <div>
                    <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Products</p>
                    <h3 class="text-4xl font-black text-slate-800">{{ products.length }}</h3>
                </div>
                <div class="p-4 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl shadow-sm text-2xl">📦</div>
            </div>
          </div>
          
          <div class="relative bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-all duration-300 overflow-hidden group cursor-default">
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div class="flex justify-between items-start relative z-10">
                <div>
                    <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Revenue (Pending)</p>
                    <h3 class="text-3xl font-black text-emerald-600 mt-2">
                        ฿ {{ formatPrice(orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total_price), 0)) }}
                    </h3>
                </div>
                <div class="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-2xl shadow-sm text-2xl">💰</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tab==='orders'" class="space-y-6 animate-fade-in">
        
        <div v-if="orders.length === 0" class="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">✨</div>
            <h2 class="text-2xl font-bold text-slate-800">All caught up!</h2>
            <p class="text-slate-500 mt-2 font-light">You have no pending orders to process.</p>
        </div>

        <div v-else class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50/80 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                        <th class="px-8 py-5">Order ID</th>
                        <th class="px-8 py-5">Customer</th>
                        <th class="px-8 py-5">Amount</th>
                        <th class="px-8 py-5">Status</th>
                        <th class="px-8 py-5">Date</th>
                        <th class="px-8 py-5 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    <tr v-for="o in orders" :key="o.order_id" class="hover:bg-slate-50/50 transition-colors group relative cursor-pointer" @click="viewOrder(o)">
                        <td class="absolute left-0 top-0 h-full w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></td>
                        
                        <td class="px-8 py-5 font-mono text-sm text-slate-500">#{{ o.order_id }}</td>
                        <td class="px-8 py-5 font-semibold text-slate-700">{{ o.email }}</td>
                        <td class="px-8 py-5 font-bold text-slate-900">฿ {{ formatPrice(o.total_price) }}</td>
                        <td class="px-8 py-5">
                            <span :class="`px-3 py-1.5 rounded-full text-[11px] font-bold border uppercase tracking-widest shadow-sm ${statusColor(o.status)}`">
                                {{ o.status }}
                            </span>
                        </td>
                        <td class="px-8 py-5 text-sm text-slate-500">{{ formatDate(o.created_at) }}</td>
                        <td class="px-8 py-5 text-right">
                            <button class="bg-white text-slate-700 font-medium text-sm border border-slate-200 px-4 py-1.5 rounded-lg group-hover:border-slate-800 group-hover:bg-slate-800 group-hover:text-white transition-all shadow-sm">
                                Manage
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <div v-if="tab==='products'" class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div class="relative w-72">
                <input type="text" placeholder="Search products..." class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all">
                <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button @click="tab='products_form'; resetProductForm()" class="bg-gradient-to-r from-slate-900 to-black text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-black/20 active:scale-95 transition-all text-sm flex items-center gap-2">
                <span>+</span> Add Product
            </button>
        </div>

        <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50/80 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                        <th class="px-8 py-5">Product Info</th>
                        <th class="px-8 py-5">Price</th>
                        <th class="px-8 py-5">Stock</th>
                        <th class="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    <tr v-for="p in products" :key="p.product_id" class="hover:bg-slate-50/50 transition-colors group">
                        <td class="px-8 py-5 flex items-center gap-5">
                            <div class="w-14 h-14 rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden shrink-0">
                                <img v-if="p.image_url" :src="`http://localhost:3003${p.image_url}`" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                            </div>
                            <div>
                                <p class="font-bold text-sm text-slate-800">{{ p.product_name }}</p>
                                <p class="text-xs text-amber-600 font-medium mt-0.5 uppercase tracking-wide">{{ p.category_name }}</p>
                            </div>
                        </td>
                        <td class="px-8 py-5 text-sm font-bold text-slate-700">฿ {{ formatPrice(p.price) }}</td>
                        <td class="px-8 py-5 text-sm">
                            <span :class="p.stock > 10 ? 'text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-bold' : 'text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md font-bold'">
                                {{ p.stock }} units
                            </span>
                        </td>
                        <td class="px-8 py-5 text-right space-x-3">
                            <button @click="editProduct(p)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                            <button @click="deleteProduct(p.product_id)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">🗑️</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <div v-if="tab==='products_form'" class="max-w-4xl mx-auto animate-fade-in">
         <div class="flex items-center justify-between mb-6">
             <div>
                <button @click="tab='products'" class="text-slate-400 hover:text-slate-800 font-medium text-sm flex items-center gap-2 mb-2 transition">← Back to Products</button>
                <h2 class="text-3xl font-black text-slate-800">{{ productForm.id ? 'Edit Masterpiece' : 'Add New Instrument' }}</h2>
             </div>
         </div>

         <div class="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 
                 <div class="col-span-2 md:col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 transition-colors cursor-pointer relative group" @click="$refs.fileInput.click()">
                     <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden">
                     <img v-if="productForm.image_preview" :src="productForm.image_preview" class="h-64 object-contain rounded-xl shadow-sm group-hover:scale-105 transition">
                     <div v-else class="text-center text-slate-400 flex flex-col items-center">
                         <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-2xl group-hover:-translate-y-1 transition">📷</div>
                         <p class="text-sm font-bold text-slate-600">Click to upload image</p>
                         <p class="text-xs mt-1">High quality JPEG or PNG</p>
                     </div>
                 </div>

                 <div class="col-span-2 md:col-span-1 space-y-6">
                     <div>
                         <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Product Name</label>
                         <input v-model="productForm.product_name" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-slate-800">
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Price (฿)</label>
                             <input v-model="productForm.price" type="number" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-slate-800">
                         </div>
                         <div>
                             <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Stock</label>
                             <input v-model="productForm.stock" type="number" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-slate-800">
                         </div>
                     </div>
                     <div>
                         <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Category</label>
                         <select v-model="productForm.category_id" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-slate-800 appearance-none">
                             <option value="" disabled>Select Category</option>
                             <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.category_name }}</option>
                         </select>
                     </div>
                 </div>

                 <div class="col-span-2">
                     <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                     <textarea v-model="productForm.description" rows="4" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-slate-800 leading-relaxed"></textarea>
                 </div>
             </div>
             <div class="flex justify-end gap-4 pt-8 border-t border-slate-100">
                 <button @click="tab='products'" class="px-8 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                 <button @click="saveProduct" class="bg-gradient-to-r from-slate-900 to-black text-white px-10 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-black/20 active:scale-95 transition-all w-48">Save Product</button>
             </div>
         </div>
      </div>

      <div v-if="tab==='categories'" class="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-6 items-end">
            <div class="flex-1 w-full">
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Category Name</label>
                <input v-model="categoryForm.name" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-slate-800" placeholder="e.g. Electric Guitars">
            </div>
            <div class="flex gap-3 w-full md:w-auto">
                <button v-if="categoryForm.id" @click="categoryForm={id:null, name:''}" class="px-6 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition w-full md:w-auto">Cancel</button>
                <button @click="saveCategory" class="bg-gradient-to-r from-slate-900 to-black text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-black/20 active:scale-95 transition-all whitespace-nowrap w-full md:w-auto">{{ categoryForm.id ? 'Update' : 'Add Category' }}</button>
            </div>
        </div>

        <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
             <table class="w-full text-left">
                <thead class="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                        <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">ID</th>
                        <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Name</th>
                        <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    <tr v-for="c in categories" :key="c.category_id" class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-8 py-5 text-slate-400 font-mono text-sm">#{{ c.category_id }}</td>
                        <td class="px-8 py-5 font-bold text-slate-700 text-lg">{{ c.category_name }}</td>
                        <td class="px-8 py-5 text-right space-x-3">
                            <button @click="editCategory(c)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                            <button @click="deleteCategory(c.category_id)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">🗑️</button>
                        </td>
                    </tr>
                </tbody>
             </table>
        </div>
      </div>

    </div>
  </main>

  <div v-if="showOrderModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showOrderModal = false"></div>
      
      <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-pop-in border border-white/20">
          
          <div class="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 relative overflow-hidden">
              <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div class="relative z-10">
                  <p class="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Order Summary</p>
                  <h3 class="text-3xl font-black text-slate-800">#{{ selectedOrder.order_id }}</h3>
                  <p class="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-slate-300"></span> {{ formatDate(selectedOrder.created_at) }} 
                      <span class="w-1 h-1 rounded-full bg-slate-300"></span> {{ selectedOrder.email }}
                  </p>
              </div>
              <button @click="showOrderModal = false" class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shadow-sm relative z-10">✕</button>
          </div>

          <div class="p-8 overflow-y-auto flex-1 bg-white">
              
              <div class="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Action: Update Status</p>
                  <div class="flex flex-wrap gap-3">
                      <button @click="updateOrderStatus('paid')" :class="`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:shadow-md active:scale-95 ${selectedOrder.status === 'paid' ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/30' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'}`">💳 Paid</button>
                      <button @click="updateOrderStatus('shipped')" :class="`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:shadow-md active:scale-95 ${selectedOrder.status === 'shipped' ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/30' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'}`">🚚 Shipped</button>
                      <button @click="updateOrderStatus('completed')" class="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:shadow-md active:scale-95 bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white">✅ Mark as Completed</button>
                      <button @click="updateOrderStatus('cancelled')" :class="`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:shadow-md active:scale-95 ${selectedOrder.status === 'cancelled' ? 'bg-rose-600 text-white border-rose-600 shadow-rose-500/30' : 'bg-white text-slate-600 border-slate-200 hover:border-rose-400 hover:text-rose-600'}`">❌ Cancelled</button>
                  </div>
              </div>

              <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Order Items</p>
              
              <div v-if="modalLoading" class="text-center py-10 text-slate-400">Loading items...</div>
              
              <div v-else class="space-y-3">
                  <div v-for="item in orderItems" :key="item.order_item_id" class="flex items-center gap-5 p-4 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl transition shadow-sm">
                      <div class="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                          <img v-if="item.image_url" :src="`http://localhost:3003${item.image_url}`" class="w-full h-full object-cover">
                      </div>
                      <div class="flex-1">
                          <p class="font-bold text-slate-800">{{ item.product_name }}</p>
                          <p class="text-sm text-slate-500 mt-1 font-medium">{{ item.quantity }} × ฿ {{ formatPrice(item.price) }}</p>
                      </div>
                      <div class="font-black text-slate-800 text-lg">
                          ฿ {{ formatPrice(item.total_price) }}
                      </div>
                  </div>
              </div>

          </div>

          <div class="p-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <span class="text-slate-500 font-bold uppercase tracking-widest text-xs">Grand Total</span>
              <span class="text-3xl font-black text-slate-900">฿ {{ formatPrice(selectedOrder.total_price) }}</span>
          </div>

      </div>
  </div>

</div>
</template>

<style scoped>
/* Animations ทำให้ดูสมูท หรูหรา */
.animate-fade-in {
    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-pop-in {
    animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes popIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Custom Scrollbar for better UI */
::-webkit-scrollbar {
    width: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>