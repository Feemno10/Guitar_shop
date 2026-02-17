import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3003"
})

/* แนบ Token */
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ======================
   CART API
====================== */

/* โหลด cart */
export const getCartAPI = () => {
  return api.get("/cart")
}

/* เพิ่มสินค้า */
export const addCartAPI = (product_id, quantity = 1) => {
  return api.post("/cart", {
    product_id,
    quantity
  })
}

/* เปลี่ยนจำนวน */
export const updateCartAPI = (cart_id, quantity) => {
  return api.put(`/cart/${cart_id}`, {
    quantity
  })
}

/* ลบสินค้า */
export const removeItemAPI = (cart_id) => {
  return api.delete(`/cart/${cart_id}`)
}

/* ล้างตะกร้า */
export const clearCartAPI = () => {
  return api.delete("/cart")
}

export default api
