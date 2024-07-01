import { createRouter, createWebHashHistory } from "vue-router"

const Home = () => import('../pages/index.vue')
const Client = () => import('../pages/client/index.vue')
const Doctor = () => import('../pages/doctor/index.vue')

const BasicVideoCall = () => import('../pages/basic/basicVideoCall/index.vue')
const VideoPage = () => import('../pages/videoPage/videoPage.vue')

const basicRoutes = [
  {
    path: '/basic-video-call',
    name: 'BasicVideoCall',
    component: BasicVideoCall,
    meta: { title: "视频通话" }
  },
  {
    path: '/video-page',
    name: 'VideoPage',
    component: VideoPage,
    meta: { title: "视频通话" }
  },
]
const advancedRoutes = []
const pluginRoutes = []

const routes = [

  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: { title: "首页入口" }
  },
  {
    path: "/client",
    name: "Client",
    component: Client,
    meta: { title: "客户入口" }
  },
  {
    path: "/doctor",
    name: "Doctor",
    component: Doctor,
    meta: { title: "医生入口" }
  },
  ...basicRoutes,
  ...advancedRoutes,
  ...pluginRoutes,
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})