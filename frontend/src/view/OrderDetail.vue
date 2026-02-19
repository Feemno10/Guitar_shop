<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import api from "../services/api"
import html2pdf from "html2pdf.js"

const route = useRoute()
const router = useRouter()

const order = ref(null)
const items = ref([])
const loading = ref(true)
const printArea = ref(null)

const loadData = async () => {
  try {
    loading.value = true
    const res = await api.get(`/orders/${route.params.id}`)
    order.value = res.data.order
    items.value = res.data.items
  } catch (err) {
    alert("ไม่พบข้อมูลคำสั่งซื้อ")
    router.push("/orders")
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const currentStep = computed(() => {
    if (!order.value) return 0
    const s = order.value.status
    if (s === 'paid') return 2
    if (s === 'shipped') return 3
    if (s === 'completed') return 4
    if (s === 'cancelled') return -1
    return 1 // pending
})

const formatDate = (dateString) => {
    if(!dateString) return '-'
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
}

const formatPrice = (price) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price)

// ✅ แก้บัค PDF แล้ว
const exportPDF = () => {
  const element = printArea.value
  const opt = {
    margin: 10,
    filename: `Order-${order.value.order_id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, 
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  html2pdf().set(opt).from(element).save()
}
</script>

<template>
<div class="min-h-screen bg-[#f3f4f6] py-10 font-sans text-[#1f2937]">
  <div class="max-w-4xl mx-auto px-6">
    
    <div class="flex justify-between items-center mb-8 no-print">
        <button @click="router.push('/')" class="text-[#6b7280] hover:text-[#000000]">← Back to Shop</button>
        <div class="flex gap-3">
             <button @click="router.push('/orders')" class="bg-[#ffffff] border border-[#e5e7eb] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f9fafb]">History</button>
             <button @click="exportPDF" class="bg-[#000000] text-[#ffffff] px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#1f2937] shadow-lg">Download Receipt</button>
        </div>
    </div>

    <div v-if="loading" class="text-center py-20 text-[#9ca3af]">Loading Order Details...</div>

    <div v-else ref="printArea" class="bg-[#ffffff] shadow-xl rounded-2xl overflow-hidden">
        
        <div class="p-8 md:p-12 bg-[#000000] text-[#ffffff] relative">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <p class="text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-2">Order Confirmed</p>
                    <h1 class="text-4xl font-serif font-medium">Order #{{ order.order_id }}</h1>
                    <p class="text-[#9ca3af] text-sm mt-2">{{ formatDate(order.created_at) }}</p>
                </div>
                <div class="text-right">
                    <p class="text-[#9ca3af] text-xs uppercase tracking-wider mb-1">Total Amount</p>
                    <p class="text-3xl font-bold text-[#ffffff]">{{ formatPrice(order.total_price) }}</p>
                </div>
            </div>

            <div v-if="currentStep !== -1" class="mt-12 relative px-4 no-print">
                <div class="absolute top-1/2 left-0 w-full h-0.5 bg-[#1f2937] -translate-y-1/2"></div>
                <div class="absolute top-1/2 left-0 h-0.5 bg-[#f59e0b] -translate-y-1/2 transition-all duration-1000" :style="{ width: `${(currentStep - 1) * 33.33}%` }"></div>

                <div class="relative flex justify-between text-xs font-bold uppercase tracking-widest">
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-4 h-4 rounded-full border-2 border-[#f59e0b] bg-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.8)] z-10"></div>
                        <span class="text-[#f59e0b]">Pending</span>
                    </div>
                    <div class="flex flex-col items-center gap-3">
                        <div :class="`w-4 h-4 rounded-full border-2 transition-colors z-10 ${currentStep >= 2 ? 'bg-[#f59e0b] border-[#f59e0b]' : 'bg-[#000000] border-[#4b5563]'}`"></div>
                        <span :class="currentStep >= 2 ? 'text-[#f59e0b]' : 'text-[#6b7280]'">Paid</span>
                    </div>
                    <div class="flex flex-col items-center gap-3">
                        <div :class="`w-4 h-4 rounded-full border-2 transition-colors z-10 ${currentStep >= 3 ? 'bg-[#f59e0b] border-[#f59e0b]' : 'bg-[#000000] border-[#4b5563]'}`"></div>
                        <span :class="currentStep >= 3 ? 'text-[#f59e0b]' : 'text-[#6b7280]'">Shipped</span>
                    </div>
                    <div class="flex flex-col items-center gap-3">
                        <div :class="`w-4 h-4 rounded-full border-2 transition-colors z-10 ${currentStep >= 4 ? 'bg-[#f59e0b] border-[#f59e0b]' : 'bg-[#000000] border-[#4b5563]'}`"></div>
                        <span :class="currentStep >= 4 ? 'text-[#f59e0b]' : 'text-[#6b7280]'">Completed</span>
                    </div>
                </div>
            </div>
            <div v-else class="mt-8 p-3 bg-[#fef2f2] border border-[#fca5a5] text-[#ef4444] rounded text-center text-sm tracking-widest uppercase">
                Order Cancelled
            </div>
        </div>

        <div class="p-8 md:p-12">
            <h2 class="text-xl font-bold mb-6 border-b border-[#e5e7eb] pb-4 text-[#111827]">Items Ordered</h2>
            <table class="w-full text-left">
                <thead class="text-xs text-[#9ca3af] uppercase tracking-wider">
                    <tr>
                        <th class="pb-4">Product</th>
                        <th class="pb-4 text-center">Qty</th>
                        <th class="pb-4 text-right">Price</th>
                        <th class="pb-4 text-right">Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#f3f4f6]">
                    <tr v-for="item in items" :key="item.order_item_id">
                        <td class="py-4">
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-20 bg-[#f3f4f6] rounded overflow-hidden shadow-sm">
                                    <img v-if="item.image_url" :src="`http://localhost:3003${item.image_url}`" class="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p class="font-bold text-[#111827]">{{ item.product_name }}</p>
                                    <p class="text-xs text-[#6b7280] mt-1">Ref: {{ item.order_item_id }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="py-4 text-center text-[#4b5563]">{{ item.quantity }}</td>
                        <td class="py-4 text-right text-[#6b7280]">{{ formatPrice(item.price) }}</td>
                        <td class="py-4 text-right font-bold text-[#111827]">{{ formatPrice(item.total_price) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="mt-12 flex flex-col md:flex-row justify-between items-end gap-10">
                <div class="text-sm text-[#6b7280] max-w-xs">
                    <p class="font-bold text-[#000000] mb-2 uppercase tracking-wide">Customer Note</p>
                    <p>Thank you for choosing Feem Guitar Shop. Please keep this receipt for your records.</p>
                </div>
                <div class="w-full md:w-80 bg-[#fafaf9] p-6 rounded-xl border border-[#f5f5f4]">
                    <div class="flex justify-between mb-3 text-[#4b5563] text-sm"><span>Subtotal</span><span>{{ formatPrice(order.total_price) }}</span></div>
                    <div class="flex justify-between mb-4 text-[#4b5563] text-sm"><span>Shipping</span><span class="text-[#059669] font-medium">Free Express</span></div>
                    <div class="border-t border-[#e5e7eb] pt-4 flex justify-between text-xl font-bold text-[#111827]">
                        <span>Grand Total</span><span>{{ formatPrice(order.total_price) }}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="bg-[#f3f4f6] p-4 text-center text-[10px] text-[#9ca3af] uppercase tracking-widest">
             © 2024 Feem Guitar Shop. Premium Instruments.
        </div>
    </div>

  </div>
</div>
</template>

<style scoped>
@media print {
    .no-print { display: none !important; }
    body { background-color: #ffffff; }
    .shadow-xl { box-shadow: none; border: 1px solid #e5e7eb; }
}
</style>