<template>
  <div class="page-container">
    <h2>城市运营监测</h2>
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8"><el-card><div>监测设施数<br><b>8</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>数据更新频率<br><b>1次/天</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>异常响应时效<br><b>1小时</b></div></el-card></el-col>
    </el-row>
    <el-card style="margin-top:20px;">
      <div slot="header">设施监测明细</div>
      <el-table :data="tableData" style="width:100%">
        <el-table-column prop="name" label="设施名称" width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="lastUpdate" label="最近更新时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'CityOperation',
  data() {
    return {
      tableData: [
        { name: '供水厂', type: '水务', status: '正常', lastUpdate: '2024-05-30' },
        { name: '变电站', type: '电力', status: '异常', lastUpdate: '2024-05-30' },
        { name: '公交枢纽', type: '交通', status: '正常', lastUpdate: '2024-05-30' }
      ]
    }
  }
}
</script>
<style scoped>
.page-container { padding: 20px; }
</style> 