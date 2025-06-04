<template>
  <div class="metadata-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>元数据概览</span>
            <el-button style="float: right; padding: 3px 0" type="text">刷新</el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据定义总数</div>
                <div class="stat-value">{{ metadataStats.definitions }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据源总数</div>
                <div class="stat-value">{{ metadataStats.sources }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据关系总数</div>
                <div class="stat-value">{{ metadataStats.relationships }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">元数据完整率</div>
                <div class="stat-value">100%</div>
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
            <span>数据关系网络</span>
          </div>
          <div ref="relationChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>元数据列表</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="metadataList" style="width: 100%">
            <el-table-column prop="code" label="元数据编号" width="120"></el-table-column>
            <el-table-column prop="name" label="元数据名称" width="180"></el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getTypeType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="数据源" width="150"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="mini" type="primary" @click="handleRelation(scope.row)">关系</el-button>
                <el-button size="mini" type="text" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据关系对话框 -->
    <el-dialog title="数据关系" :visible.sync="relationDialogVisible" width="60%">
      <div v-if="currentMetadata">
        <h3>{{ currentMetadata.name }}</h3>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="上游数据" name="upstream">
            <el-table :data="upstreamData" style="width: 100%">
              <el-table-column prop="name" label="数据名称"></el-table-column>
              <el-table-column prop="type" label="关系类型"></el-table-column>
              <el-table-column prop="description" label="关系描述"></el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="下游数据" name="downstream">
            <el-table :data="downstreamData" style="width: 100%">
              <el-table-column prop="name" label="数据名称"></el-table-column>
              <el-table-column prop="type" label="关系类型"></el-table-column>
              <el-table-column prop="description" label="关系描述"></el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="relationDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Metadata',
  data() {
    return {
      metadataList: [
        {
          code: 'MD001',
          name: '交通流量数据',
          type: '数据定义',
          source: '交通数据源',
          updateTime: '2024-01-20 10:30:00',
          status: '已发布',
          description: '描述道路交通流量相关数据'
        },
        {
          code: 'MD002',
          name: '空气质量数据',
          type: '数据源',
          source: '环保数据源',
          updateTime: '2024-01-19 15:20:00',
          status: '待审核',
          description: '描述空气质量监测相关数据'
        },
        {
          code: 'MD003',
          name: '用电量数据',
          type: '数据关系',
          source: '能源数据源',
          updateTime: '2024-01-18 09:15:00',
          status: '已过期',
          description: '描述用电量相关数据关系'
        }
      ],
      relationDialogVisible: false,
      currentMetadata: null,
      activeTab: 'upstream',
      upstreamData: [
        {
          name: '道路基础数据',
          type: '依赖关系',
          description: '依赖道路基础信息'
        },
        {
          name: '天气数据',
          type: '关联关系',
          description: '与天气数据关联'
        }
      ],
      downstreamData: [
        {
          name: '交通预测数据',
          type: '被依赖',
          description: '用于交通预测'
        },
        {
          name: '交通分析数据',
          type: '被引用',
          description: '用于交通分析'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['metadataStats'])
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
              { value: 35, name: '交通数据源' },
              { value: 25, name: '环保数据源' },
              { value: 20, name: '能源数据源' },
              { value: 15, name: '水务数据源' },
              { value: 5, name: '其他数据源' }
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

      // 初始化数据关系网络图表
      const relationChart = this.$echarts.init(this.$refs.relationChart)
      relationChart.setOption({
        title: {
          text: '数据关系网络'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          data: ['数据定义', '数据源', '数据关系']
        },
        series: [
          {
            type: 'graph',
            layout: 'force',
            data: [
              { name: '交通数据', category: 0 },
              { name: '环保数据', category: 0 },
              { name: '能源数据', category: 0 },
              { name: '交通数据源', category: 1 },
              { name: '环保数据源', category: 1 },
              { name: '能源数据源', category: 1 }
            ],
            links: [
              { source: '交通数据', target: '交通数据源' },
              { source: '环保数据', target: '环保数据源' },
              { source: '能源数据', target: '能源数据源' },
              { source: '交通数据', target: '环保数据' },
              { source: '环保数据', target: '能源数据' }
            ],
            categories: [
              { name: '数据定义' },
              { name: '数据源' },
              { name: '数据关系' }
            ],
            roam: true,
            label: {
              show: true,
              position: 'right'
            },
            force: {
              repulsion: 100
            }
          }
        ]
      })
    },
    getTypeType(type) {
      const types = {
        '数据定义': 'primary',
        '数据源': 'success',
        '数据关系': 'warning'
      }
      return types[type] || 'info'
    },
    getStatusType(status) {
      const types = {
        '已发布': 'success',
        '待审核': 'warning',
        '已过期': 'danger'
      }
      return types[status] || 'info'
    },
    handleEdit(row) {
      this.$message({
        message: `正在编辑元数据：${row.name}`,
        type: 'info'
      })
    },
    handleRelation(row) {
      this.currentMetadata = row
      this.relationDialogVisible = true
    },
    handleDetail(row) {
      this.$message({
        message: `查看元数据详情：${row.name}`,
        type: 'info'
      })
    }
  }
}
</script>

<style scoped>
.metadata-container {
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