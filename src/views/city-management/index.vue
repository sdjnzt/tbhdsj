<template>
  <div class="city-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>城市设施概览</span>
            <el-button style="float: right; padding: 3px 0" type="text">刷新</el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">设施总数</div>
                <div class="stat-value">{{ cityData.facilities.length }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">正常运行率</div>
                <div class="stat-value">98%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">告警数量</div>
                <div class="stat-value">{{ cityData.alerts.length }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">维护任务</div>
                <div class="stat-value">5</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>设施分布地图</span>
          </div>
          <div ref="mapChart" style="height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>设施类型分布</span>
          </div>
          <div ref="typeChart" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>设施列表</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="facilities" style="width: 100%">
            <el-table-column prop="code" label="设施编号" width="120"></el-table-column>
            <el-table-column prop="name" label="设施名称" width="180"></el-table-column>
            <el-table-column prop="type" label="设施类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getTypeType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="位置" width="180"></el-table-column>
            <el-table-column prop="status" label="运行状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastCheck" label="最后检查时间" width="180"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleMonitor(scope.row)">监控</el-button>
                <el-button size="mini" type="primary" @click="handleMaintain(scope.row)">维护</el-button>
                <el-button size="mini" type="text" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设施监控对话框 -->
    <el-dialog title="设施监控" :visible.sync="monitorDialogVisible" width="60%">
      <div v-if="currentFacility">
        <h3>{{ currentFacility.name }}</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <div ref="monitorChart" style="height: 300px"></div>
          </el-col>
          <el-col :span="12">
            <el-descriptions title="运行参数" :column="1" border>
              <el-descriptions-item label="运行时长">{{ currentFacility.runtime }}</el-descriptions-item>
              <el-descriptions-item label="负载率">{{ currentFacility.load }}%</el-descriptions-item>
              <el-descriptions-item label="能耗">{{ currentFacility.power }}kWh</el-descriptions-item>
              <el-descriptions-item label="温度">{{ currentFacility.temperature }}°C</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="monitorDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'CityManagement',
  data() {
    return {
      facilities: [
        {
          code: 'CF001',
          name: '交通信号灯系统',
          type: '交通设施',
          location: '市中心十字路口',
          status: '正常运行',
          lastCheck: '2024-01-20 10:30:00',
          description: '智能交通信号灯控制系统',
          runtime: '720小时',
          load: '65',
          power: '120',
          temperature: '35'
        },
        {
          code: 'CF002',
          name: '空气质量监测站',
          type: '环保设施',
          location: '城市公园',
          status: '待维护',
          lastCheck: '2024-01-19 15:20:00',
          description: '实时监测空气质量指标',
          runtime: '480小时',
          load: '45',
          power: '80',
          temperature: '28'
        },
        {
          code: 'CF003',
          name: '智能路灯系统',
          type: '照明设施',
          location: '主干道',
          status: '告警',
          lastCheck: '2024-01-18 09:15:00',
          description: '智能调光路灯系统',
          runtime: '360小时',
          load: '85',
          power: '150',
          temperature: '42'
        }
      ],
      monitorDialogVisible: false,
      currentFacility: null
    }
  },
  computed: {
    ...mapState(['cityData'])
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      // 初始化地图图表
      const mapChart = this.$echarts.init(this.$refs.mapChart)
      mapChart.setOption({
        title: {
          text: '设施分布'
        },
        tooltip: {
          trigger: 'item'
        },
        visualMap: {
          min: 0,
          max: 100,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true
        },
        series: [
          {
            type: 'map',
            map: 'city',
            label: {
              show: true
            },
            data: [
              { name: '市中心', value: 80 },
              { name: '商业区', value: 60 },
              { name: '居民区', value: 40 },
              { name: '工业区', value: 20 }
            ]
          }
        ]
      })

      // 初始化设施类型分布图表
      const typeChart = this.$echarts.init(this.$refs.typeChart)
      typeChart.setOption({
        title: {
          text: '设施类型分布'
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
              { value: 35, name: '交通设施' },
              { value: 25, name: '环保设施' },
              { value: 20, name: '照明设施' },
              { value: 15, name: '安防设施' },
              { value: 5, name: '其他设施' }
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
    getTypeType(type) {
      const types = {
        '交通设施': 'primary',
        '环保设施': 'success',
        '照明设施': 'warning'
      }
      return types[type] || 'info'
    },
    getStatusType(status) {
      const types = {
        '正常运行': 'success',
        '待维护': 'warning',
        '告警': 'danger'
      }
      return types[status] || 'info'
    },
    handleMonitor(row) {
      this.currentFacility = row
      this.monitorDialogVisible = true
      this.$nextTick(() => {
        const monitorChart = this.$echarts.init(this.$refs.monitorChart)
        monitorChart.setOption({
          title: {
            text: '运行趋势'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: [65, 60, 55, 70, 75, 80, 75, 70],
              type: 'line',
              smooth: true
            }
          ]
        })
      })
    },
    handleMaintain(row) {
      this.$message({
        message: `正在安排维护：${row.name}`,
        type: 'info'
      })
    },
    handleDetail(row) {
      this.$message({
        message: `查看设施详情：${row.name}`,
        type: 'info'
      })
    }
  }
}
</script>

<style scoped>
.city-container {
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