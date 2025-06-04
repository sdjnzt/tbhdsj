<template>
  <div class="version-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="version-card">
          <div class="card-header">
            <i class="el-icon-document"></i>
            <span>标准总数</span>
          </div>
          <div class="card-body">
            <div class="card-value">156</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+12</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="version-card">
          <div class="card-header">
            <i class="el-icon-s-release"></i>
            <span>当前版本</span>
          </div>
          <div class="card-body">
            <div class="card-value">V2.3.1</div>
            <div class="card-footer">
              <span>发布时间</span>
              <span>2024-01-15</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="version-card">
          <div class="card-header">
            <i class="el-icon-s-flag"></i>
            <span>待审核</span>
          </div>
          <div class="card-body">
            <div class="card-value">8</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+2</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="version-card">
          <div class="card-header">
            <i class="el-icon-s-check"></i>
            <span>已发布</span>
          </div>
          <div class="card-body">
            <div class="card-value">148</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+10</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>版本发布趋势</span>
          </div>
          <div ref="trendChart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>标准类型分布</span>
          </div>
          <div ref="typeChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>版本列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">创建版本</el-button>
          </div>
          <el-table :data="versionList" style="width: 100%">
            <el-table-column prop="version" label="版本号" width="120"></el-table-column>
            <el-table-column prop="name" label="版本名称" width="180"></el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getVersionType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="standardCount" label="标准数量" width="100"></el-table-column>
            <el-table-column prop="creator" label="创建人" width="120"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="publishTime" label="发布时间" width="180"></el-table-column>
            <el-table-column label="操作" width="250">
              <template slot-scope="scope">
                <el-button size="mini" @click="handlePublish(scope.row)" v-if="scope.row.status === '待发布'">发布</el-button>
                <el-button size="mini" type="warning" @click="handleRollback(scope.row)" v-if="scope.row.status === '已发布'">回滚</el-button>
                <el-button size="mini" type="info" @click="handleDetail(scope.row)">详情</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.row)" v-if="scope.row.status === '待发布'">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 版本详情对话框 -->
    <el-dialog title="版本详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentVersion">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="版本号">{{ currentVersion.version }}</el-descriptions-item>
          <el-descriptions-item label="版本名称">{{ currentVersion.name }}</el-descriptions-item>
          <el-descriptions-item label="版本类型">{{ currentVersion.type }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">{{ currentVersion.status }}</el-descriptions-item>
          <el-descriptions-item label="标准数量">{{ currentVersion.standardCount }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentVersion.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentVersion.createTime }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ currentVersion.publishTime }}</el-descriptions-item>
          <el-descriptions-item label="版本说明" :span="2">{{ currentVersion.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="standard-list" style="margin-top: 20px">
          <h3>标准列表</h3>
          <el-table :data="currentVersion.standards" style="width: 100%">
            <el-table-column prop="code" label="标准编码" width="120"></el-table-column>
            <el-table-column prop="name" label="标准名称" width="180"></el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStandardType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 创建版本对话框 -->
    <el-dialog title="创建版本" :visible.sync="createDialogVisible" width="50%">
      <el-form :model="versionForm" label-width="100px">
        <el-form-item label="版本号">
          <el-input v-model="versionForm.version" placeholder="例如：V2.3.2"></el-input>
        </el-form-item>
        <el-form-item label="版本名称">
          <el-input v-model="versionForm.name" placeholder="请输入版本名称"></el-input>
        </el-form-item>
        <el-form-item label="版本类型">
          <el-select v-model="versionForm.type" placeholder="请选择版本类型">
            <el-option label="主版本" value="主版本"></el-option>
            <el-option label="次版本" value="次版本"></el-option>
            <el-option label="补丁版本" value="补丁版本"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本说明">
          <el-input type="textarea" v-model="versionForm.description" rows="4" placeholder="请输入版本说明"></el-input>
        </el-form-item>
        <el-form-item label="选择标准">
          <el-transfer
            v-model="versionForm.selectedStandards"
            :data="allStandards"
            :titles="['可选标准', '已选标准']"
            :props="{
              key: 'code',
              label: 'name'
            }">
          </el-transfer>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitVersion">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DataStandardVersion',
  data() {
    return {
      versionList: [
        {
          version: 'V2.3.1',
          name: '2024年第一季度标准更新',
          type: '主版本',
          status: '已发布',
          standardCount: 45,
          creator: '张三',
          createTime: '2024-01-15 10:00:00',
          publishTime: '2024-01-15 14:00:00',
          description: '更新了数据标准规范，新增了数据质量评估标准',
          standards: [
            {
              code: 'DS001',
              name: '数据标准规范V2.3',
              type: '基础标准',
              status: '已发布',
              updateTime: '2024-01-15 10:00:00'
            },
            {
              code: 'DS002',
              name: '数据质量评估标准V1.0',
              type: '评估标准',
              status: '已发布',
              updateTime: '2024-01-15 10:00:00'
            }
          ]
        },
        {
          version: 'V2.3.2',
          name: '数据安全标准更新',
          type: '次版本',
          status: '待发布',
          standardCount: 12,
          creator: '李四',
          createTime: '2024-01-20 09:00:00',
          publishTime: '-',
          description: '新增数据安全相关标准',
          standards: []
        }
      ],
      allStandards: [
        { code: 'DS001', name: '数据标准规范V2.3' },
        { code: 'DS002', name: '数据质量评估标准V1.0' },
        { code: 'DS003', name: '数据安全标准V1.0' },
        { code: 'DS004', name: '元数据管理标准V2.0' }
      ],
      detailDialogVisible: false,
      createDialogVisible: false,
      currentVersion: null,
      versionForm: {
        version: '',
        name: '',
        type: '',
        description: '',
        selectedStandards: []
      }
    }
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      // 初始化趋势图表
      const trendChart = this.$echarts.init(this.$refs.trendChart)
      trendChart.setOption({
        title: {
          text: '版本发布趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['版本数', '标准数']
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: [
          {
            type: 'value',
            name: '版本数'
          },
          {
            type: 'value',
            name: '标准数'
          }
        ],
        series: [
          {
            name: '版本数',
            type: 'bar',
            data: [2, 3, 2, 4, 3, 2]
          },
          {
            name: '标准数',
            type: 'line',
            yAxisIndex: 1,
            data: [20, 35, 25, 45, 35, 25]
          }
        ]
      })

      // 初始化类型分布图表
      const typeChart = this.$echarts.init(this.$refs.typeChart)
      typeChart.setOption({
        title: {
          text: '标准类型分布'
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
              { value: 40, name: '基础标准' },
              { value: 30, name: '评估标准' },
              { value: 20, name: '安全标准' },
              { value: 10, name: '其他标准' }
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
    getVersionType(type) {
      const types = {
        '主版本': 'primary',
        '次版本': 'success',
        '补丁版本': 'warning'
      }
      return types[type] || 'info'
    },
    getStandardType(type) {
      const types = {
        '基础标准': 'primary',
        '评估标准': 'success',
        '安全标准': 'warning'
      }
      return types[type] || 'info'
    },
    getStatusType(status) {
      const types = {
        '已发布': 'success',
        '待发布': 'warning',
        '已回滚': 'info',
        '已删除': 'danger'
      }
      return types[status] || 'info'
    },
    handlePublish(row) {
      this.$message({
        message: `发布版本：${row.version}`,
        type: 'success'
      })
    },
    handleRollback(row) {
      this.$message({
        message: `回滚版本：${row.version}`,
        type: 'warning'
      })
    },
    handleDetail(row) {
      this.currentVersion = row
      this.detailDialogVisible = true
    },
    handleDelete(row) {
      this.$message({
        message: `删除版本：${row.version}`,
        type: 'info'
      })
    },
    handleCreate() {
      this.createDialogVisible = true
    },
    submitVersion() {
      this.$message({
        message: '版本创建成功',
        type: 'success'
      })
      this.createDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.version-container {
  padding: 20px;
}

.version-card {
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

.standard-list {
  h3 {
    margin-bottom: 15px;
    font-weight: 500;
    color: #303133;
  }
}
</style> 