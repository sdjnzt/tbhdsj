<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">
        <span class="title">太白湖大数据平台</span>
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <template v-for="route in menuRoutes">
          <el-submenu v-if="route.children && route.children.length" :index="route.path" :key="route.path">
            <template slot="title">
              <i :class="route.meta && route.meta.icon ? route.meta.icon : 'el-icon-menu'"></i>
              <span>{{ route.meta && route.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="route.path + '/' + child.path"
            >
              {{ child.meta && child.meta.title }}
            </el-menu-item>
          </el-submenu>
        </template>
      </el-menu>
    </aside>
    <!-- 主体部分 -->
    <section class="main-section">
      <!-- 顶部栏 -->
      <header class="navbar">
        <div class="navbar-left">
          <i class="el-icon-s-fold menu-toggle" @click="toggleSidebar"></i>
          <breadcrumb />
        </div>
        <div class="navbar-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              <i class="el-icon-user-solid avatar"></i> 管理员 <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>个人信息</el-dropdown-item>
              <el-dropdown-item>修改密码</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </header>
      <!-- 标签页 -->
      <tags-view />
      <!-- 主内容区 -->
      <main class="app-main">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import TagsView from '@/components/TagsView'
import { mapState } from 'vuex'
export default {
  name: 'Layout',
  components: { Breadcrumb, TagsView },
  computed: {
    menuRoutes() {
      // 只显示有meta.title的一级路由（过滤掉redirect等）
      return this.$router.options.routes.filter(r => r.meta && r.meta.title)
    }
  },
  methods: {
    toggleSidebar() {
      // 可扩展侧边栏收缩逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  background: #f4f6f8;
}
.sidebar {
  width: 210px;
  background: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    background: #263445;
    .title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      text-align: center;
      letter-spacing: 1px;
    }
  }
}
.main-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.navbar {
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  .navbar-left {
    display: flex;
    align-items: center;
    .menu-toggle {
      font-size: 20px;
      margin-right: 16px;
      cursor: pointer;
    }
  }
  .navbar-right {
    .avatar {
      font-size: 20px;
      color: #409EFF;
      margin-right: 6px;
    }
  }
}
.app-main {
  flex: 1;
  padding: 20px;
  background: #f4f6f8;
  overflow-y: auto;
}
</style> 