<template>
  <div class="page-container">
    <h2>数据质量把控</h2>
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8"><el-card><div>检查总数<br><b>120</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>准确率<br><b>100%</b></div></el-card></el-col>
      <el-col :span="8"><el-card><div>纠正成功率<br><b>96%</b></div></el-card></el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card><div ref="qualityChart" style="height:300px;">质量趋势图（mock）</div></el-card>
      </el-col>
      <el-col :span="8">
        <el-card><div ref="typeChart" style="height:300px;">问题类型分布（mock）</div></el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top:20px;">
      <div slot="header">数据质量明细</div>
      <el-table :data="tableData" style="width:100%">
        <el-table-column prop="item" label="检查项" width="120" />
        <el-table-column prop="accuracy" label="准确率" width="120" />
        <el-table-column prop="correction" label="纠正成功率" width="120" />
        <el-table-column prop="lastReport" label="最近报告时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'QualityControl',
  data() {
    return {
      tableData: [
        { item: '人口数据', accuracy: '100%', correction: '98%', lastReport: '2024-05-31' },
        { item: '企业数据', accuracy: '100%', correction: '95%', lastReport: '2024-05-31' },
        { item: '环境数据', accuracy: '100%', correction: '96%', lastReport: '2024-05-31' }
      ]
    }
  }
}
</script>
<style scoped>
.page-container { padding: 20px; }
</style> 