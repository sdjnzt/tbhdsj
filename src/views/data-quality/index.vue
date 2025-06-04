<template>
  <div class="quality-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据质量概览</span>
            <el-button style="float: right; padding: 3px 0" type="text">刷新</el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据准确率</div>
                <div class="stat-value">{{ qualityData.metrics.accuracy }}%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据完整率</div>
                <div class="stat-value">{{ qualityData.metrics.completeness }}%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据一致率</div>
                <div class="stat-value">{{ qualityData.metrics.consistency }}%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据修正成功率</div>
                <div class="stat-value">95%</div>
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
            <span>质量指标趋势</span>
          </div>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据源质量分布</span>
          </div>
          <div ref="sourceChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据质量问题列表</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="issues" style="width: 100%">
            <el-table-column prop="time" label="发现时间" width="180"></el-table-column>
            <el-table-column prop="source" label="数据源" width="150"></el-table-column>
            <el-table-column prop="type" label="问题类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getIssueType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="严重程度" width="120">
              <template slot-scope="scope">
                <el-tag :type="getLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="问题描述"></el-table-column>
            <el-table-column prop="status" label="处理状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleFix(scope.row)">修复</el-button>
                <el-button size="mini" type="primary" @click="handleAnalyze(scope.row)">分析</el-button>
                <el-button size="mini" type="text" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 问题分析对话框 -->
    <el-dialog title="问题分析" :visible.sync="analyzeDialogVisible" width="60%">
      <div v-if="currentIssue">
        <h3>{{ currentIssue.type }} - {{ currentIssue.source }}</h3>
        <el-steps :active="2" finish-status="success" style="margin: 20px 0">
          <el-step title="问题发现" description="系统自动检测到数据异常"></el-step>
          <el-step title="原因分析" description="通过算法分析可能的原因"></el-step>
          <el-step title="解决方案" description="提供修复建议"></el-step>
        </el-steps>
        <el-card class="box-card" style="margin-top: 20px">
          <div slot="header">
            <span>分析结果</span>
          </div>
          <div>
            <p><strong>可能原因：</strong></p>
            <ul>
              <li>数据源系统异常</li>
              <li>数据传输过程中断</li>
              <li>数据格式转换错误</li>
            </ul>
            <p><strong>建议解决方案：</strong></p>
            <ul>
              <li>检查数据源系统状态</li>
              <li>验证数据传输链路</li>
              <li>执行数据格式转换修复</li>
            </ul>
          </div>
        </el-card>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="analyzeDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleAnalyzeConfirm">确认修复</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DataQuality',
  data() {
    return {
      issues: [
        {
          time: '2024-01-20 10:30:00',
          source: '交通数据源',
          type: '数据缺失',
          level: '严重',
          description: '交通流量数据部分缺失',
          status: '待处理'
        },
        {
          time: '2024-01-20 10:25:00',
          source: '环保数据源',
          type: '数据异常',
          level: '警告',
          description: '空气质量数据异常波动',
          status: '处理中'
        },
        {
          time: '2024-01-20 10:20:00',
          source: '能源数据源',
          type: '格式错误',
          level: '一般',
          description: '用电量数据格式不一致',
          status: '已处理'
        }
      ],
      analyzeDialogVisible: false,
      currentIssue: null
    }
  },
  computed: {
    ...mapState(['qualityData'])
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      // 初始化质量指标趋势图表
      const trendChart = this.$echarts.init(this.$refs.trendChart)
      trendChart.setOption({
        title: {
          text: '质量指标趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['准确率', '完整率', '一致率']
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value',
          min: 80,
          max: 100
        },
        series: [
          {
            name: '准确率',
            type: 'line',
            data: [95, 93, 96, 94, 95, 97]
          },
          {
            name: '完整率',
            type: 'line',
            data: [92, 94, 93, 95, 96, 94]
          },
          {
            name: '一致率',
            type: 'line',
            data: [91, 93, 92, 94, 95, 96]
          }
        ]
      })

      // 初始化数据源质量分布图表
      const sourceChart = this.$echarts.init(this.$refs.sourceChart)
      sourceChart.setOption({
        title: {
          text: '数据源质量分布'
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
              { value: 35, name: '交通数据' },
              { value: 25, name: '环保数据' },
              { value: 20, name: '能源数据' },
              { value: 15, name: '水务数据' },
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
    },
    getIssueType(type) {
      const types = {
        '数据缺失': 'danger',
        '数据异常': 'warning',
        '格式错误': 'info'
      }
      return types[type] || 'info'
    },
    getLevelType(level) {
      const types = {
        '严重': 'danger',
        '警告': 'warning',
        '一般': 'info'
      }
      return types[level] || 'info'
    },
    getStatusType(status) {
      const types = {
        '待处理': 'danger',
        '处理中': 'warning',
        '已处理': 'success'
      }
      return types[status] || 'info'
    },
    handleFix(row) {
      this.$message({
        message: `正在修复问题：${row.description}`,
        type: 'info'
      })
    },
    handleAnalyze(row) {
      this.currentIssue = row
      this.analyzeDialogVisible = true
    },
    handleDetail(row) {
      this.$message({
        message: `查看问题详情：${row.description}`,
        type: 'info'
      })
    },
    handleAnalyzeConfirm() {
      this.$message({
        message: '已确认修复方案',
        type: 'success'
      })
      this.analyzeDialogVisible = false
    }
  }
}
</script>

<style scoped>
.quality-container {
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