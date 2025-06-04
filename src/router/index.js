import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/layout/index.vue'

Vue.use(VueRouter)

export const constantRoutes = [
  {
    path: '/dashboard',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'el-icon-s-home' }
      }
    ]
  },
  {
    path: '/region',
    component: Layout,
    name: 'Region',
    meta: { title: '区域治理', icon: 'el-icon-s-data' },
    children: [
      {
        path: 'insight',
        name: 'RegionInsight',
        component: () => import('@/views/region/insight.vue'),
        meta: { title: '区域状况洞察' }
      }
    ]
  },
  {
    path: '/integration',
    component: Layout,
    name: 'Integration',
    meta: { title: '一体化监管', icon: 'el-icon-s-platform' },
    children: [
      {
        path: 'monitor',
        name: 'IntegrationMonitor',
        component: () => import('@/views/integration/monitor.vue'),
        meta: { title: '综合监管管控' }
      }
    ]
  },
  {
    path: '/emergency',
    component: Layout,
    name: 'Emergency',
    meta: { title: '应急管理', icon: 'el-icon-warning' },
    children: [
      {
        path: 'situation',
        name: 'EmergencySituation',
        component: () => import('@/views/emergency/situation.vue'),
        meta: { title: '应急态势掌控' }
      }
    ]
  },
  {
    path: '/quality',
    component: Layout,
    name: 'Quality',
    meta: { title: '数据质量管理', icon: 'el-icon-s-data' },
    children: [
      {
        path: 'control',
        name: 'QualityControl',
        component: () => import('@/views/quality/control.vue'),
        meta: { title: '数据质量把控' }
      }
    ]
  },
  {
    path: '/standard',
    component: Layout,
    name: 'Standard',
    meta: { title: '数据标准管理', icon: 'el-icon-s-order' },
    children: [
      {
        path: 'coordination',
        name: 'StandardCoordination',
        component: () => import('@/views/standard/coordination.vue'),
        meta: { title: '数据规范统筹' }
      }
    ]
  },
  {
    path: '/metadata',
    component: Layout,
    name: 'Metadata',
    meta: { title: '元数据管理', icon: 'el-icon-s-grid' },
    children: [
      {
        path: 'penetration',
        name: 'MetadataPenetration',
        component: () => import('@/views/metadata/penetration.vue'),
        meta: { title: '元数据穿透治理' }
      }
    ]
  },
  {
    path: '/fusion',
    component: Layout,
    name: 'Fusion',
    meta: { title: '数据融合管理', icon: 'el-icon-s-operation' },
    children: [
      {
        path: 'integration',
        name: 'FusionIntegration',
        component: () => import('@/views/fusion/integration.vue'),
        meta: { title: '数据融合集成' }
      }
    ]
  },
  {
    path: '/city',
    component: Layout,
    name: 'City',
    meta: { title: '城市管理', icon: 'el-icon-s-platform' },
    children: [
      {
        path: 'operation',
        name: 'CityOperation',
        component: () => import('@/views/city/operation.vue'),
        meta: { title: '城市运营监测' }
      }
    ]
  },
  {
    path: '/',
    redirect: '/dashboard'
  }
]

const createRouter = () => new VueRouter({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router