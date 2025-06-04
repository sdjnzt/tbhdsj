<template>
  <div class="page-container">
    <h2>应急态势掌控</h2>
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8"><el-card><div>事件总数<br><b>8</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>已响应<br><b>7</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>平均响应时长<br><b>18分钟</b></div></el-card></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card><div ref="situationChart" style="height:300px;">应急态势趋势图（mock）</div></el-card>
      </el-col>
      <el-col :span="8">
        <el-card><div ref="eventChart" style="height:300px;">事件类型分布（mock）</div></el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top:20px;">
      <div slot="header">应急事件明细</div>
      <el-table :data="tableData" style="width:100%">
        <el-table-column prop="event" label="事件名称" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="responseTime" label="响应时长" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'EmergencySituation',
  data() {
    return {
      tableData: [
        { event: '洪水预警', type: '自然灾害', status: '已响应', responseTime: '15分钟', updateTime: '2024-06-01 08:00' },
        { event: '交通事故', type: '安全事件', status: '已响应', responseTime: '20分钟', updateTime: '2024-06-01 08:00' },
        { event: '电力故障', type: '设备故障', status: '处理中', responseTime: '—', updateTime: '2024-06-01 08:00' }
      ]
    }
  }
}
</script>
<style scoped>
.page-container { padding: 20px; }
</style> 