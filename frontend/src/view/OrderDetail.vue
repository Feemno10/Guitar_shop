<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import api from "../services/api"
import html2pdf from "html2pdf.js"

const route = useRoute()
const router = useRouter()

const items = ref([])
const printArea = ref(null)

const today = new Date().toLocaleDateString("th-TH")

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
   BACK HOME
====================== */
const goHome = () => {
  router.push("/")
}

/* ======================
   EXPORT PDF
====================== */
const exportPDF = () => {

  const element = printArea.value
  element.classList.add("pdf-mode")

  const opt = {
    margin: 10,
    filename: `order-${route.params.id}.pdf`,
    image: { type: "jpeg", quality: 0.98 },

    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    }
  }

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      element.classList.remove("pdf-mode")
    })
}
</script>

<template>
<div class="max-w-5xl mx-auto p-10">

<!-- Buttons -->
<div class="flex justify-between mb-6">

<button
  @click="goHome"
  class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
>
⬅ กลับหน้าหลัก
</button>

<button
  @click="exportPDF"
  class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
>
📄 Export PDF
</button>

</div>

<!-- ================= PRINT AREA ================= -->
<div ref="printArea" class="receipt">

<!-- HEADER -->
<div class="receipt-header">

<h1 class="shop-name">
🎸 Feem Guitar Shop
</h1>

<p class="shop-sub">
ใบเสร็จรับเงิน / Receipt
</p>

</div>

<hr class="divider" />

<!-- ORDER INFO -->
<div class="order-info">

<div>
<p>Order No :</p>
<b>#{{ route.params.id }}</b>
</div>

<div class="text-right">
<p>วันที่ :</p>
<b>{{ today }}</b>
</div>

</div>

<hr class="divider" />

<!-- EMPTY -->
<div v-if="items.length === 0">
ไม่พบข้อมูลคำสั่งซื้อ
</div>

<!-- TABLE -->
<table v-else class="order-table">

<thead>
<tr>
<th>สินค้า</th>
<th>ราคา</th>
<th>จำนวน</th>
<th>รวม</th>
</tr>
</thead>

<tbody>

<tr v-for="item in items" :key="item.order_item_id">

<td class="product-cell">
<img
  :src="`http://localhost:3003${item.image_url}`"
  class="product-img"
/>

<span>{{ item.product_name }}</span>
</td>

<td>฿ {{ Number(item.price).toLocaleString() }}</td>

<td>{{ item.quantity }}</td>

<td>
฿ {{ Number(item.total_price).toLocaleString() }}
</td>

</tr>

</tbody>

</table>

<!-- TOTAL -->
<div class="total-box">

<h2>
รวมทั้งหมด : ฿ {{ totalPrice.toLocaleString() }}
</h2>

</div>

<!-- SIGNATURE -->
<div class="signature">

<p>ผู้ขาย</p>

<div class="sign-name">
feemno10
</div>

</div>

</div>

</div>
</template>

<style scoped>

/* ===== RECEIPT STYLE ===== */

.receipt{
  background:white;
  padding:40px;
  border-radius:10px;
  font-family: "Sarabun", sans-serif;
}

.shop-name{
  font-size:28px;
  font-weight:bold;
  text-align:center;
}

.shop-sub{
  text-align:center;
  color:gray;
}

.receipt-header{
  margin-bottom:10px;
}

.divider{
  margin:20px 0;
  border-top:1px solid #ddd;
}

.order-info{
  display:flex;
  justify-content:space-between;
}

.order-table{
  width:100%;
  border-collapse:collapse;
  margin-top:20px;
}

.order-table th{
  border-bottom:2px solid #333;
  padding:10px;
  text-align:left;
}

.order-table td{
  padding:12px 10px;
  border-bottom:1px solid #eee;
}

.product-cell{
  display:flex;
  align-items:center;
  gap:10px;
}

.product-img{
  width:60px;
  height:60px;
  object-fit:cover;
  border-radius:6px;
}

.total-box{
  text-align:right;
  margin-top:30px;
  font-size:20px;
  font-weight:bold;
}

.signature{
  margin-top:60px;
  text-align:right;
}

.sign-name{
  font-family: cursive;
  font-size:24px;
  margin-top:10px;
}

/* ===== FIX PDF COLOR ===== */

.pdf-mode {
  background:white !important;
  color:black !important;
}

.pdf-mode *{
  background:transparent !important;
  color:black !important;
}

</style>
