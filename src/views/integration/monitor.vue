<template>
  <div class="page-container">
    <h2>综合监管管控</h2>
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8"><el-card><div>监管领域数<br><b>5</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>异常告警数<br><b>12</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>告警准确率<br><b>92%</b></div></el-card></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card><div ref="monitorChart" style="height:300px;">业务动态监控图（mock）</div></el-card>
      </el-col>
      <el-col :span="8">
        <el-card><div ref="alarmChart" style="height:300px;">异常告警分布（mock）</div></el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top:20px;">
      <div slot="header">业务监管明细</div>
      <el-table :data="tableData" style="width:100%">
        <el-table-column prop="domain" label="业务领域" width="120" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="alarm" label="异常告警数" width="120" />
        <el-table-column prop="lastUpdate" label="最近更新时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'IntegrationMonitor',
  data() {
    return {
      tableData: [
        { domain: '交通', status: '正常', alarm: 2, lastUpdate: '2024-06-01 08:00' },
        { domain: '环保', status: '异常', alarm: 5, lastUpdate: '2024-06-01 08:00' },
        { domain: '用电', status: '正常', alarm: 1, lastUpdate: '2024-06-01 08:00' },
        { domain: '企业', status: '正常', alarm: 2, lastUpdate: '2024-06-01 08:00' },
        { domain: '人口', status: '正常', alarm: 2, lastUpdate: '2024-06-01 08:00' }
      ]
    }
  }
}
</script>
<style scoped>
.page-container { padding: 20px; }
</style> 