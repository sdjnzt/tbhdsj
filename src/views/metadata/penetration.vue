<template>
  <div class="page-container">
    <h2>元数据穿透治理</h2>
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8"><el-card><div>元数据总数<br><b>1200</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>录入准确率<br><b>100%</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>平均查询时长<br><b>3秒</b></div></el-card></el-col>
    </el-row>
    <el-card style="margin-top:20px;">
      <div slot="header">元数据明细</div>
      <el-table :data="tableData" style="width:100%">
        <el-table-column prop="name" label="元数据名称" width="180" />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="relation" label="关系" width="120" />
        <el-table-column prop="lastUpdate" label="最近更新时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'MetadataPenetration',
  data() {
    return {
      tableData: [
        { name: '人口表', source: '公安', relation: '关联企业表', lastUpdate: '2024-05-30' },
        { name: '企业表', source: '工商', relation: '关联人口表', lastUpdate: '2024-05-30' },
        { name: '环境表', source: '环保', relation: '无', lastUpdate: '2024-05-30' }
      ]
    }
  }
}
</script>
<style scoped>
.page-container { padding: 20px; }
</style> 