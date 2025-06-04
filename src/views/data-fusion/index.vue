<template>
  <div class="fusion-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据融合概览</span>
            <el-button style="float: right; padding: 3px 0" type="text">刷新</el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据源总数</div>
                <div class="stat-value">{{ fusionData.sources.length }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">融合状态</div>
                <div class="stat-value">
                  <el-tag :type="getStatusType(fusionData.status)">{{ fusionData.status }}</el-tag>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">融合成功率</div>
                <div class="stat-value">{{ fusionData.successRate }}%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据量</div>
                <div class="stat-value">1.2TB</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据源分布</span>
          </div>
          <div ref="sourceChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>融合趋势</span>
          </div>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据源列表</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="sources" style="width: 100%">
            <el-table-column prop="code" label="数据源编号" width="120"></el-table-column>
            <el-table-column prop="name" label="数据源名称" width="180"></el-table-column>
            <el-table-column prop="type" label="数据类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getTypeType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="format" label="数据格式" width="120"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleSync(scope.row)">同步</el-button>
                <el-button size="mini" type="primary" @click="handleTransform(scope.row)">转换</el-button>
                <el-button size="mini" type="text" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据转换对话框 -->
    <el-dialog title="数据转换" :visible.sync="transformDialogVisible" width="60%">
      <div v-if="currentSource">
        <h3>{{ currentSource.name }}</h3>
        <el-steps :active="2" finish-status="success" style="margin: 20px 0">
          <el-step title="数据读取" description="从数据源读取数据"></el-step>
          <el-step title="格式转换" description="转换为统一格式"></el-step>
          <el-step title="数据验证" description="验证数据完整性"></el-step>
          <el-step title="数据存储" description="存储到目标系统"></el-step>
        </el-steps>
        <el-form label-width="120px">
          <el-form-item label="目标格式">
            <el-select v-model="targetFormat" placeholder="请选择目标格式">
              <el-option label="JSON" value="json"></el-option>
              <el-option label="XML" value="xml"></el-option>
              <el-option label="CSV" value="csv"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="转换规则">
            <el-input type="textarea" v-model="transformRules" rows="4"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="transformDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTransformConfirm">确认转换</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DataFusion',
  data() {
    return {
      sources: [
        {
          code: 'DS001',
          name: '交通流量数据',
          type: '实时数据',
          format: 'JSON',
          updateTime: '2024-01-20 10:30:00',
          status: '已同步',
          description: '道路交通流量实时数据'
        },
        {
          code: 'DS002',
          name: '空气质量数据',
          type: '监测数据',
          format: 'XML',
          updateTime: '2024-01-19 15:20:00',
          status: '待转换',
          description: '空气质量监测站数据'
        },
        {
          code: 'DS003',
          name: '用电量数据',
          type: '统计数据',
          format: 'CSV',
          updateTime: '2024-01-18 09:15:00',
          status: '同步中',
          description: '城市用电量统计数据'
        }
      ],
      transformDialogVisible: false,
      currentSource: null,
      targetFormat: 'json',
      transformRules: '{\n  "field1": "newField1",\n  "field2": "newField2"\n}'
    }
  },
  computed: {
    ...mapState(['fusionData'])
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      // 初始化数据源分布图表
      const sourceChart = this.$echarts.init(this.$refs.sourceChart)
      sourceChart.setOption({
        title: {
          text: '数据源分布'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: [
              { value: 35, name: '实时数据' },
              { value: 25, name: '监测数据' },
              { value: 20, name: '统计数据' },
              { value: 15, name: '历史数据' },
              { value: 5, name: '其他数据' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })

      // 初始化融合趋势图表
      const trendChart = this.$echarts.init(this.$refs.trendChart)
      trendChart.setOption({
        title: {
          text: '数据融合趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330],
            type: 'line',
            smooth: true
          }
        ]
      })
    },
    getTypeType(type) {
      const types = {
        '实时数据': 'primary',
        '监测数据': 'success',
        '统计数据': 'warning'
      }
      return types[type] || 'info'
    },
    getStatusType(status) {
      const types = {
        '已同步': 'success',
        '待转换': 'warning',
        '同步中': 'info'
      }
      return types[status] || 'info'
    },
    handleSync(row) {
      this.$message({
        message: `正在同步数据源：${row.name}`,
        type: 'info'
      })
    },
    handleTransform(row) {
      this.currentSource = row
      this.transformDialogVisible = true
    },
    handleDetail(row) {
      this.$message({
        message: `查看数据源详情：${row.name}`,
        type: 'info'
      })
    },
    handleTransformConfirm() {
      this.$message({
        message: '数据转换已开始',
        type: 'success'
      })
      this.transformDialogVisible = false
    }
  }
}
</script>

<style scoped>
.fusion-container {
  padding: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.box-card {
  margin-bottom: 20px;
}
</style> 