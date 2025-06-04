<template>
  <div class="page-container">
    <h2>数据融合集成</h2>
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8"><el-card><div>融合数据量<br><b>320万</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>准确率<br><b>97%</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>生成时效<br><b>45分钟</b></div></el-card></el-col>
    </el-row>
    <el-card style="margin-top:20px;">
      <div slot="header">融合数据明细</div>
      <el-table :data="tableData" style="width:100%">
        <el-table-column prop="name" label="数据名称" width="180" />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="accuracy" label="准确率" width="120" />
        <el-table-column prop="generateTime" label="生成时效" width="120" />
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'FusionIntegration',
  data() {
    return {
      tableData: [
        { name: '人口融合数据', source: '公安+卫健', accuracy: '98%', generateTime: '30分钟' },
        { name: '企业融合数据', source: '工商+税务', accuracy: '95%', generateTime: '50分钟' },
        { name: '环境融合数据', source: '环保+气象', accuracy: '97%', generateTime: '40分钟' }
      ]
    }
  }
}
</script>
<style scoped>
.page-container { padding: 20px; }
</style> 