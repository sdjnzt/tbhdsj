<template>
  <div class="tags-view-container">
    <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick" closable @tab-remove="removeTab">
      <el-tab-pane
        v-for="tag in tags"
        :key="tag.path"
        :label="tag.title"
        :name="tag.path"
      />
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'TagsView',
  data() {
    return {
      tags: [
        { path: '/dashboard', title: '首页' }
      ],
      activeTab: '/dashboard'
    }
  },
  watch: {
    $route(to) {
      this.addTag(to)
      this.activeTab = to.path
    }
  },
  created() {
    this.addTag(this.$route)
    this.activeTab = this.$route.path
  },
  methods: {
    addTag(route) {
      if (!this.tags.find(tag => tag.path === route.path)) {
        this.tags.push({ path: route.path, title: route.meta.title || route.name })
      }
    },
    handleTabClick(tab) {
      this.$router.push(tab.name)
    },
    removeTab(targetName) {
      const tabs = this.tags
      let activeTab = this.activeTab
      if (activeTab === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.path === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeTab = nextTab.path
            }
          }
        })
      }
      this.tags = tabs.filter(tab => tab.path !== targetName)
      this.activeTab = activeTab
      this.$router.push(activeTab)
    }
  }
}
</script>

<style scoped>
.tags-view-container {
  background: #fff;
  padding: 0 16px;
  border-bottom: 1px solid #e8e8e8;
}
</style> 