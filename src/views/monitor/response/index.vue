<template>
  <div class="response-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="response-card">
          <div class="card-header">
            <i class="el-icon-s-claim"></i>
            <span>响应总数</span>
          </div>
          <div class="card-body">
            <div class="card-value">256</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+28</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="response-card">
          <div class="card-header">
            <i class="el-icon-time"></i>
            <span>待响应</span>
          </div>
          <div class="card-body">
            <div class="card-value">45</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="down">-12</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="response-card">
          <div class="card-header">
            <i class="el-icon-success"></i>
            <span>已响应</span>
          </div>
          <div class="card-body">
            <div class="card-value">211</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+40</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="response-card">
          <div class="card-header">
            <i class="el-icon-data-analysis"></i>
            <span>平均响应时间</span>
          </div>
          <div class="card-body">
            <div class="card-value">8分钟</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="down">-3分钟</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>响应趋势</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">刷新</el-button>
          </div>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>响应类型分布</span>
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
            <span>响应列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">创建响应</el-button>
          </div>
          <el-table :data="responseList" style="width: 100%">
            <el-table-column prop="id" label="响应ID" width="120"></el-table-column>
            <el-table-column prop="name" label="响应名称" width="180"></el-table-column>
            <el-table-column prop="type" label="响应类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getResponseType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="100">
              <template slot-scope="scope">
                <el-tag :type="getPriorityType(scope.row.priority)">{{ scope.row.priority }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="响应来源" width="150"></el-table-column>
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

    <!-- 响应详情对话框 -->
    <el-dialog title="响应详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentResponse">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="响应ID">{{ currentResponse.id }}</el-descriptions-item>
          <el-descriptions-item label="响应名称">{{ currentResponse.name }}</el-descriptions-item>
          <el-descriptions-item label="响应类型">{{ currentResponse.type }}</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ currentResponse.priority }}</el-descriptions-item>
          <el-descriptions-item label="响应来源">{{ currentResponse.source }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentResponse.status }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentResponse.createTime }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ currentResponse.handler }}</el-descriptions-item>
          <el-descriptions-item label="响应描述" :span="2">{{ currentResponse.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="response-content" style="margin-top: 20px">
          <h3>处理记录</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in currentResponse.activities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type">
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>

    <!-- 处理响应对话框 -->
    <el-dialog title="处理响应" :visible.sync="processDialogVisible" width="50%">
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

    <!-- 创建响应对话框 -->
    <el-dialog title="创建响应" :visible.sync="createDialogVisible" width="50%">
      <el-form :model="responseForm" label-width="100px">
        <el-form-item label="响应名称">
          <el-input v-model="responseForm.name" placeholder="请输入响应名称"></el-input>
        </el-form-item>
        <el-form-item label="响应类型">
          <el-select v-model="responseForm.type" placeholder="请选择响应类型">
            <el-option label="系统响应" value="system"></el-option>
            <el-option label="业务响应" value="business"></el-option>
            <el-option label="安全响应" value="security"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="responseForm.priority" placeholder="请选择优先级">
            <el-option label="高" value="high"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="低" value="low"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="响应来源">
          <el-input v-model="responseForm.source" placeholder="请输入响应来源"></el-input>
        </el-form-item>
        <el-form-item label="响应描述">
          <el-input type="textarea" v-model="responseForm.description" rows="4" placeholder="请输入响应描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitResponse">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ResponseManagement',
  data() {
    return {
      responseList: [
        {
          id: 'RES001',
          name: '系统性能优化',
          type: '系统响应',
          priority: '高',
          source: '性能监控',
          status: '待处理',
          createTime: '2024-01-15 10:00:00',
          handler: '',
          description: '系统性能需要优化，响应时间过长',
          activities: [
            {
              content: '系统检测到性能问题',
              timestamp: '2024-01-15 10:00:00',
              type: 'warning'
            }
          ]
        },
        {
          id: 'RES002',
          name: '业务数据处理',
          type: '业务响应',
          priority: '中',
          source: '业务监控',
          status: '处理中',
          createTime: '2024-01-15 09:30:00',
          handler: '李四',
          description: '业务数据处理异常，需要及时处理',
          activities: [
            {
              content: '检测到业务数据处理异常',
              timestamp: '2024-01-15 09:30:00',
              type: 'warning'
            },
            {
              content: '李四开始处理响应',
              timestamp: '2024-01-15 09:35:00',
              type: 'primary'
            }
          ]
        }
      ],
      detailDialogVisible: false,
      processDialogVisible: false,
      createDialogVisible: false,
      currentResponse: null,
      processForm: {
        method: '',
        description: ''
      },
      responseForm: {
        name: '',
        type: '',
        priority: '',
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
        values: [35, 30, 40, 45, 40, 35, 32]
      }

      trendChart.setOption({
        title: {
          text: '响应趋势'
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
          name: '响应数量'
        },
        series: [
          {
            name: '响应数量',
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
        { value: 50, name: '系统响应' },
        { value: 30, name: '业务响应' },
        { value: 20, name: '安全响应' }
      ]

      typeChart.setOption({
        title: {
          text: '响应类型分布'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['系统响应', '业务响应', '安全响应']
        },
        series: [
          {
            name: '响应类型',
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
    getResponseType(type) {
      const types = {
        '系统响应': 'danger',
        '业务响应': 'warning',
        '安全响应': 'info'
      }
      return types[type] || 'info'
    },
    getPriorityType(priority) {
      const types = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      }
      return types[priority] || 'info'
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
      this.currentResponse = row
      this.detailDialogVisible = true
    },
    handleProcess(row) {
      this.currentResponse = row
      this.processDialogVisible = true
    },
    handleDelete(row) {
      this.$message({
        message: `删除响应：${row.name}`,
        type: 'warning'
      })
    },
    handleCreate() {
      this.createDialogVisible = true
    },
    submitProcess() {
      this.$message({
        message: '响应处理成功',
        type: 'success'
      })
      this.processDialogVisible = false
    },
    submitResponse() {
      this.$message({
        message: '响应创建成功',
        type: 'success'
      })
      this.createDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.response-container {
  padding: 20px;
}

.response-card {
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

.response-content {
  h3 {
    margin-bottom: 15px;
    font-weight: 500;
    color: #303133;
  }
}
</style> 