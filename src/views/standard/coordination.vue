<template>
  <div class="page-container">
    <h2>数据规范统筹</h2>
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8"><el-card><div>标准总数<br><b>32</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>覆盖率<br><b>97%</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>更新时效<br><b>3天</b></div></el-card></el-col>
    </el-row>
    <el-card style="margin-top:20px;">
      <div slot="header">数据标准明细</div>
      <el-table :data="tableData" style="width:100%">
        <el-table-column prop="name" label="标准名称" width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="coverage" label="覆盖率" width="120" />
        <el-table-column prop="lastUpdate" label="最近更新时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'StandardCoordination',
  data() {
    return {
      tableData: [
        { name: '人口数据标准', type: '结构', coverage: '100%', lastUpdate: '2024-05-30' },
        { name: '企业数据标准', type: '内容', coverage: '95%', lastUpdate: '2024-05-30' },
        { name: '环境数据标准', type: '结构', coverage: '97%', lastUpdate: '2024-05-30' }
      ]
    }
  }
}
</script>
<style scoped>
.page-container { padding: 20px; }
</style> 