import { createRouter, createWebHistory } from "vue-router"

import Home from "../view/Home.vue"
import Login from "../view/Login.vue"
import Register from "../view/Register.vue"
import AdminDashboard from "../admin/AdminDashboard.vue"
import ProductDetail from "../view/ProductDetail.vue"
import Cart from "../view/Cart.vue"

/* NEW */
import OrderDetail from "../view/OrderDetail.vue"
import MyOrders from "../view/MyOrders.vue"


const routes = [
  { path: "/", component: Home },

  { path: "/login", component: Login },

  { path: "/register", component: Register },

  /* Product */
  { path: "/product/:id", component: ProductDetail },

  /* Cart */
  {
    path: "/cart",
    component: Cart,
    meta: { requiresAuth: true }
  },

  /* ===== USER ORDERS ===== */

  {
    path: "/orders",
    component: MyOrders,
    meta: { requiresAuth: true }
  },

  {
    path: "/orders/:id",
    component: OrderDetail,
    meta: { requiresAuth: true }
  },

  {
    path: "/admin",
    component: AdminDashboard,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* ===== ROUTE GUARD ===== */
router.beforeEach((to, from, next) => {

  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))

  /* LOGIN REQUIRED */
  if (to.meta.requiresAuth && !token) {
    return next("/login")
  }

  /* ADMIN REQUIRED */
  if (to.meta.requiresAdmin) {

    if (!token) return next("/login")

    if (user?.role !== "admin") {
      return next("/")
    }
  }

  next()
})

export default router
