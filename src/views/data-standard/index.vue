<template>
  <div class="standard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据标准概览</span>
            <el-button style="float: right; padding: 3px 0" type="text">刷新</el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">标准文档总数</div>
                <div class="stat-value">{{ standardData.standards.length }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">标准符合率</div>
                <div class="stat-value">{{ standardData.compliance }}%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">更新及时率</div>
                <div class="stat-value">100%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">标准覆盖率</div>
                <div class="stat-value">98%</div>
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
            <span>标准分布</span>
          </div>
          <div ref="distributionChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>标准更新趋势</span>
          </div>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据标准列表</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="standards" style="width: 100%">
            <el-table-column prop="code" label="标准编号" width="120"></el-table-column>
            <el-table-column prop="name" label="标准名称" width="180"></el-table-column>
            <el-table-column prop="category" label="标准类别" width="120">
              <template slot-scope="scope">
                <el-tag :type="getCategoryType(scope.row.category)">{{ scope.row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="version" label="版本" width="100"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="标准描述"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="mini" type="primary" @click="handleVersion(scope.row)">版本</el-button>
                <el-button size="mini" type="text" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 版本历史对话框 -->
    <el-dialog title="版本历史" :visible.sync="versionDialogVisible" width="60%">
      <div v-if="currentStandard">
        <h3>{{ currentStandard.name }}</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(version, index) in versions"
            :key="index"
            :timestamp="version.time"
            :type="version.type">
            <h4>版本 {{ version.number }}</h4>
            <p>{{ version.description }}</p>
            <p><strong>更新人：</strong>{{ version.author }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="versionDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DataStandard',
  data() {
    return {
      standards: [
        {
          code: 'DS001',
          name: '交通数据采集标准',
          category: '采集标准',
          version: 'V2.1',
          updateTime: '2024-01-20 10:30:00',
          status: '生效中',
          description: '规范交通数据采集流程和格式要求'
        },
        {
          code: 'DS002',
          name: '环保数据存储标准',
          category: '存储标准',
          version: 'V1.5',
          updateTime: '2024-01-19 15:20:00',
          status: '待审核',
          description: '规范环保数据的存储格式和结构'
        },
        {
          code: 'DS003',
          name: '能源数据交换标准',
          category: '交换标准',
          version: 'V3.0',
          updateTime: '2024-01-18 09:15:00',
          status: '已过期',
          description: '规范能源数据的交换接口和协议'
        }
      ],
      versionDialogVisible: false,
      currentStandard: null,
      versions: [
        {
          number: 'V2.1',
          time: '2024-01-20 10:30:00',
          type: 'primary',
          description: '更新数据采集频率要求',
          author: '张三'
        },
        {
          number: 'V2.0',
          time: '2024-01-15 14:20:00',
          type: 'success',
          description: '新增数据质量要求',
          author: '李四'
        },
        {
          number: 'V1.9',
          time: '2024-01-10 11:15:00',
          type: 'info',
          description: '优化数据格式定义',
          author: '王五'
        }
      ]
    }
  },
  computed: {
    ...mapState(['standardData'])
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      // 初始化标准分布图表
      const distributionChart = this.$echarts.init(this.$refs.distributionChart)
      distributionChart.setOption({
        title: {
          text: '标准类别分布'
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
              { value: 35, name: '采集标准' },
              { value: 25, name: '存储标准' },
              { value: 20, name: '交换标准' },
              { value: 15, name: '安全标准' },
              { value: 5, name: '其他标准' }
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

      // 初始化标准更新趋势图表
      const trendChart = this.$echarts.init(this.$refs.trendChart)
      trendChart.setOption({
        title: {
          text: '标准更新趋势'
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
            data: [5, 8, 12, 10, 15, 20],
            type: 'line',
            smooth: true
          }
        ]
      })
    },
    getCategoryType(category) {
      const types = {
        '采集标准': 'primary',
        '存储标准': 'success',
        '交换标准': 'warning'
      }
      return types[category] || 'info'
    },
    getStatusType(status) {
      const types = {
        '生效中': 'success',
        '待审核': 'warning',
        '已过期': 'danger'
      }
      return types[status] || 'info'
    },
    handleEdit(row) {
      this.$message({
        message: `正在编辑标准：${row.name}`,
        type: 'info'
      })
    },
    handleVersion(row) {
      this.currentStandard = row
      this.versionDialogVisible = true
    },
    handleDetail(row) {
      this.$message({
        message: `查看标准详情：${row.name}`,
        type: 'info'
      })
    }
  }
}
</script>

<style scoped>
.standard-container {
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