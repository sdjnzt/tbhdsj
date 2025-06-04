<template>
  <div class="alarm-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="alarm-card">
          <div class="card-header">
            <i class="el-icon-warning"></i>
            <span>告警总数</span>
          </div>
          <div class="card-body">
            <div class="card-value">128</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+15</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="alarm-card">
          <div class="card-header">
            <i class="el-icon-time"></i>
            <span>待处理</span>
          </div>
          <div class="card-body">
            <div class="card-value">32</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="down">-8</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="alarm-card">
          <div class="card-header">
            <i class="el-icon-success"></i>
            <span>已处理</span>
          </div>
          <div class="card-body">
            <div class="card-value">96</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+23</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="alarm-card">
          <div class="card-header">
            <i class="el-icon-data-analysis"></i>
            <span>平均响应时间</span>
          </div>
          <div class="card-body">
            <div class="card-value">15分钟</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="down">-5分钟</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>告警趋势</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">刷新</el-button>
          </div>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>告警类型分布</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">刷新</el-button>
          </div>
          <div ref="typeChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>告警列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">创建告警</el-button>
          </div>
          <el-table :data="alarmList" style="width: 100%">
            <el-table-column prop="id" label="告警ID" width="120"></el-table-column>
            <el-table-column prop="name" label="告警名称" width="180"></el-table-column>
            <el-table-column prop="type" label="告警类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getAlarmType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="告警级别" width="100">
              <template slot-scope="scope">
                <el-tag :type="getLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="告警来源" width="150"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="handler" label="处理人" width="120"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" type="info" @click="handleDetail(scope.row)">详情</el-button>
                <el-button size="mini" type="success" @click="handleProcess(scope.row)">处理</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警详情对话框 -->
    <el-dialog title="告警详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentAlarm">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="告警ID">{{ currentAlarm.id }}</el-descriptions-item>
          <el-descriptions-item label="告警名称">{{ currentAlarm.name }}</el-descriptions-item>
          <el-descriptions-item label="告警类型">{{ currentAlarm.type }}</el-descriptions-item>
          <el-descriptions-item label="告警级别">{{ currentAlarm.level }}</el-descriptions-item>
          <el-descriptions-item label="告警来源">{{ currentAlarm.source }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentAlarm.status }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentAlarm.createTime }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ currentAlarm.handler }}</el-descriptions-item>
          <el-descriptions-item label="告警描述" :span="2">{{ currentAlarm.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="alarm-content" style="margin-top: 20px">
          <h3>处理记录</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in currentAlarm.activities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type">
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>

    <!-- 处理告警对话框 -->
    <el-dialog title="处理告警" :visible.sync="processDialogVisible" width="50%">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理方式">
          <el-select v-model="processForm.method" placeholder="请选择处理方式">
            <el-option label="自动处理" value="auto"></el-option>
            <el-option label="手动处理" value="manual"></el-option>
            <el-option label="忽略" value="ignore"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input type="textarea" v-model="processForm.description" rows="4" placeholder="请输入处理说明"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="processDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitProcess">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 创建告警对话框 -->
    <el-dialog title="创建告警" :visible.sync="createDialogVisible" width="50%">
      <el-form :model="alarmForm" label-width="100px">
        <el-form-item label="告警名称">
          <el-input v-model="alarmForm.name" placeholder="请输入告警名称"></el-input>
        </el-form-item>
        <el-form-item label="告警类型">
          <el-select v-model="alarmForm.type" placeholder="请选择告警类型">
            <el-option label="系统告警" value="system"></el-option>
            <el-option label="业务告警" value="business"></el-option>
            <el-option label="安全告警" value="security"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="告警级别">
          <el-select v-model="alarmForm.level" placeholder="请选择告警级别">
            <el-option label="一般" value="normal"></el-option>
            <el-option label="重要" value="important"></el-option>
            <el-option label="紧急" value="urgent"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="告警来源">
          <el-input v-model="alarmForm.source" placeholder="请输入告警来源"></el-input>
        </el-form-item>
        <el-form-item label="告警描述">
          <el-input type="textarea" v-model="alarmForm.description" rows="4" placeholder="请输入告警描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAlarm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AlarmManagement',
  data() {
    return {
      alarmList: [
        {
          id: 'ALM001',
          name: '系统CPU使用率过高',
          type: '系统告警',
          level: '紧急',
          source: '服务器监控',
          status: '待处理',
          createTime: '2024-01-15 10:00:00',
          handler: '',
          description: '系统CPU使用率超过90%，需要及时处理',
          activities: [
            {
              content: '系统检测到CPU使用率异常',
              timestamp: '2024-01-15 10:00:00',
              type: 'warning'
            }
          ]
        },
        {
          id: 'ALM002',
          name: '数据库连接异常',
          type: '系统告警',
          level: '重要',
          source: '数据库监控',
          status: '处理中',
          createTime: '2024-01-15 09:30:00',
          handler: '张三',
          description: '数据库连接池出现异常，连接数达到上限',
          activities: [
            {
              content: '检测到数据库连接异常',
              timestamp: '2024-01-15 09:30:00',
              type: 'warning'
            },
            {
              content: '张三开始处理告警',
              timestamp: '2024-01-15 09:35:00',
              type: 'primary'
            }
          ]
        }
      ],
      detailDialogVisible: false,
      processDialogVisible: false,
      createDialogVisible: false,
      currentAlarm: null,
      processForm: {
        method: '',
        description: ''
      },
      alarmForm: {
        name: '',
        type: '',
        level: '',
        source: '',
        description: ''
      }
    }
  },
  mounted() {
    this.initTrendChart()
    this.initTypeChart()
  },
  methods: {
    initTrendChart() {
      const trendChart = this.$echarts.init(this.$refs.trendChart)
      const data = {
        dates: ['1月1日', '1月2日', '1月3日', '1月4日', '1月5日', '1月6日', '1月7日'],
        values: [30, 25, 35, 40, 35, 30, 28]
      }

      trendChart.setOption({
        title: {
          text: '告警趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: data.dates
        },
        yAxis: {
          type: 'value',
          name: '告警数量'
        },
        series: [
          {
            name: '告警数量',
            type: 'line',
            data: data.values,
            smooth: true,
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            }
          }
        ]
      })
    },
    initTypeChart() {
      const typeChart = this.$echarts.init(this.$refs.typeChart)
      const data = [
        { value: 45, name: '系统告警' },
        { value: 35, name: '业务告警' },
        { value: 20, name: '安全告警' }
      ]

      typeChart.setOption({
        title: {
          text: '告警类型分布'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['系统告警', '业务告警', '安全告警']
        },
        series: [
          {
            name: '告警类型',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      })
    },
    getAlarmType(type) {
      const types = {
        '系统告警': 'danger',
        '业务告警': 'warning',
        '安全告警': 'info'
      }
      return types[type] || 'info'
    },
    getLevelType(level) {
      const types = {
        '紧急': 'danger',
        '重要': 'warning',
        '一般': 'info'
      }
      return types[level] || 'info'
    },
    getStatusType(status) {
      const types = {
        '待处理': 'warning',
        '处理中': 'primary',
        '已处理': 'success',
        '已忽略': 'info'
      }
      return types[status] || 'info'
    },
    handleRefresh() {
      this.initTrendChart()
      this.initTypeChart()
    },
    handleDetail(row) {
      this.currentAlarm = row
      this.detailDialogVisible = true
    },
    handleProcess(row) {
      this.currentAlarm = row
      this.processDialogVisible = true
    },
    handleDelete(row) {
      this.$message({
        message: `删除告警：${row.name}`,
        type: 'warning'
      })
    },
    handleCreate() {
      this.createDialogVisible = true
    },
    submitProcess() {
      this.$message({
        message: '告警处理成功',
        type: 'success'
      })
      this.processDialogVisible = false
    },
    submitAlarm() {
      this.$message({
        message: '告警创建成功',
        type: 'success'
      })
      this.createDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-container {
  padding: 20px;
}

.alarm-card {
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    i {
      font-size: 20px;
      margin-right: 8px;
      color: #409EFF;
    }
    
    span {
      font-size: 16px;
      color: #606266;
    }
  }
  
  .card-body {
    .card-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 10px;
    }
    
    .card-footer {
      font-size: 14px;
      color: #909399;
      
      .up {
        color: #67C23A;
        margin-left: 5px;
      }
      
      .down {
        color: #F56C6C;
        margin-left: 5px;
      }
    }
  }
}

.box-card {
  margin-bottom: 20px;
}

.alarm-content {
  h3 {
    margin-bottom: 15px;
    font-weight: 500;
    color: #303133;
  }
}
</style> 