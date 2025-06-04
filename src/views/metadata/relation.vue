<template>
  <div class="relation-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="relation-card">
          <div class="card-header">
            <i class="el-icon-connection"></i>
            <span>关系总数</span>
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
        <el-card shadow="hover" class="relation-card">
          <div class="card-header">
            <i class="el-icon-s-data"></i>
            <span>数据表数</span>
          </div>
          <div class="card-body">
            <div class="card-value">48</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+3</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="relation-card">
          <div class="card-header">
            <i class="el-icon-s-grid"></i>
            <span>字段数</span>
          </div>
          <div class="card-body">
            <div class="card-value">892</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+45</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="relation-card">
          <div class="card-header">
            <i class="el-icon-s-marketing"></i>
            <span>关系覆盖率</span>
          </div>
          <div class="card-body">
            <div class="card-value">98%</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+5%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据关系图</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">刷新</el-button>
          </div>
          <div ref="relationChart" style="height: 600px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>关系列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">创建关系</el-button>
          </div>
          <el-table :data="relationList" style="width: 100%">
            <el-table-column prop="id" label="关系ID" width="120"></el-table-column>
            <el-table-column prop="name" label="关系名称" width="180"></el-table-column>
            <el-table-column prop="sourceTable" label="源表" width="180"></el-table-column>
            <el-table-column prop="targetTable" label="目标表" width="180"></el-table-column>
            <el-table-column prop="type" label="关系类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getRelationType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="creator" label="创建人" width="120"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" type="info" @click="handleDetail(scope.row)">详情</el-button>
                <el-button size="mini" type="success" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 关系详情对话框 -->
    <el-dialog title="关系详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentRelation">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="关系ID">{{ currentRelation.id }}</el-descriptions-item>
          <el-descriptions-item label="关系名称">{{ currentRelation.name }}</el-descriptions-item>
          <el-descriptions-item label="源表">{{ currentRelation.sourceTable }}</el-descriptions-item>
          <el-descriptions-item label="目标表">{{ currentRelation.targetTable }}</el-descriptions-item>
          <el-descriptions-item label="关系类型">{{ currentRelation.type }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentRelation.status }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentRelation.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentRelation.createTime }}</el-descriptions-item>
          <el-descriptions-item label="关系描述" :span="2">{{ currentRelation.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="relation-content" style="margin-top: 20px">
          <h3>字段映射</h3>
          <el-table :data="currentRelation.mappings" style="width: 100%">
            <el-table-column prop="sourceField" label="源字段"></el-table-column>
            <el-table-column prop="targetField" label="目标字段"></el-table-column>
            <el-table-column prop="type" label="映射类型"></el-table-column>
            <el-table-column prop="description" label="说明"></el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 创建关系对话框 -->
    <el-dialog title="创建关系" :visible.sync="createDialogVisible" width="50%">
      <el-form :model="relationForm" label-width="100px">
        <el-form-item label="关系名称">
          <el-input v-model="relationForm.name" placeholder="请输入关系名称"></el-input>
        </el-form-item>
        <el-form-item label="源表">
          <el-select v-model="relationForm.sourceTable" placeholder="请选择源表">
            <el-option label="用户表" value="user_table"></el-option>
            <el-option label="订单表" value="order_table"></el-option>
            <el-option label="商品表" value="product_table"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目标表">
          <el-select v-model="relationForm.targetTable" placeholder="请选择目标表">
            <el-option label="用户表" value="user_table"></el-option>
            <el-option label="订单表" value="order_table"></el-option>
            <el-option label="商品表" value="product_table"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关系类型">
          <el-select v-model="relationForm.type" placeholder="请选择关系类型">
            <el-option label="一对一" value="one-to-one"></el-option>
            <el-option label="一对多" value="one-to-many"></el-option>
            <el-option label="多对多" value="many-to-many"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关系描述">
          <el-input type="textarea" v-model="relationForm.description" rows="4" placeholder="请输入关系描述"></el-input>
        </el-form-item>
        <el-form-item label="字段映射">
          <div v-for="(mapping, index) in relationForm.mappings" :key="index" class="mapping-item">
            <el-select v-model="mapping.sourceField" placeholder="源字段" style="width: 200px; margin-right: 10px">
              <el-option label="ID" value="id"></el-option>
              <el-option label="名称" value="name"></el-option>
              <el-option label="类型" value="type"></el-option>
            </el-select>
            <el-select v-model="mapping.targetField" placeholder="目标字段" style="width: 200px; margin-right: 10px">
              <el-option label="ID" value="id"></el-option>
              <el-option label="名称" value="name"></el-option>
              <el-option label="类型" value="type"></el-option>
            </el-select>
            <el-select v-model="mapping.type" placeholder="映射类型" style="width: 150px; margin-right: 10px">
              <el-option label="直接映射" value="direct"></el-option>
              <el-option label="转换映射" value="transform"></el-option>
            </el-select>
            <el-button type="danger" icon="el-icon-delete" circle @click="removeMapping(index)" style="margin-left: 10px"></el-button>
          </div>
          <el-button type="primary" icon="el-icon-plus" @click="addMapping" style="margin-top: 10px">添加映射</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRelation">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MetadataRelation',
  data() {
    return {
      relationList: [
        {
          id: 'REL001',
          name: '用户订单关系',
          sourceTable: '用户表',
          targetTable: '订单表',
          type: '一对多',
          status: '已启用',
          creator: '张三',
          createTime: '2024-01-15 10:00:00',
          description: '用户与订单的一对多关系',
          mappings: [
            {
              sourceField: '用户ID',
              targetField: '用户ID',
              type: '直接映射',
              description: '用户ID直接映射'
            },
            {
              sourceField: '用户名',
              targetField: '下单用户',
              type: '直接映射',
              description: '用户名直接映射'
            }
          ]
        },
        {
          id: 'REL002',
          name: '订单商品关系',
          sourceTable: '订单表',
          targetTable: '商品表',
          type: '多对多',
          status: '已启用',
          creator: '李四',
          createTime: '2024-01-20 09:00:00',
          description: '订单与商品的多对多关系',
          mappings: [
            {
              sourceField: '订单ID',
              targetField: '订单ID',
              type: '直接映射',
              description: '订单ID直接映射'
            },
            {
              sourceField: '商品ID',
              targetField: '商品ID',
              type: '直接映射',
              description: '商品ID直接映射'
            }
          ]
        }
      ],
      detailDialogVisible: false,
      createDialogVisible: false,
      currentRelation: null,
      relationForm: {
        name: '',
        sourceTable: '',
        targetTable: '',
        type: '',
        description: '',
        mappings: []
      }
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    initChart() {
      const relationChart = this.$echarts.init(this.$refs.relationChart)
      const data = {
        nodes: [
          { name: '用户表', category: 0 },
          { name: '订单表', category: 1 },
          { name: '商品表', category: 2 },
          { name: '支付表', category: 3 }
        ],
        links: [
          { source: '用户表', target: '订单表', value: '一对多' },
          { source: '订单表', target: '商品表', value: '多对多' },
          { source: '订单表', target: '支付表', value: '一对一' }
        ]
      }

      relationChart.setOption({
        title: {
          text: '数据关系图'
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            if (params.dataType === 'edge') {
              return `${params.data.source} -> ${params.data.target}<br/>关系类型: ${params.data.value}`
            }
            return params.name
          }
        },
        legend: {
          data: ['用户数据', '交易数据', '商品数据', '支付数据']
        },
        series: [
          {
            type: 'graph',
            layout: 'force',
            data: data.nodes,
            links: data.links,
            categories: [
              { name: '用户数据' },
              { name: '交易数据' },
              { name: '商品数据' },
              { name: '支付数据' }
            ],
            roam: true,
            label: {
              show: true,
              position: 'right'
            },
            force: {
              repulsion: 100,
              edgeLength: 100
            },
            lineStyle: {
              color: 'source',
              curveness: 0.3
            }
          }
        ]
      })
    },
    getRelationType(type) {
      const types = {
        '一对一': 'success',
        '一对多': 'warning',
        '多对多': 'danger'
      }
      return types[type] || 'info'
    },
    getStatusType(status) {
      const types = {
        '已启用': 'success',
        '已禁用': 'info',
        '待审核': 'warning'
      }
      return types[status] || 'info'
    },
    handleRefresh() {
      this.initChart()
    },
    handleDetail(row) {
      this.currentRelation = row
      this.detailDialogVisible = true
    },
    handleEdit(row) {
      this.$message({
        message: `编辑关系：${row.name}`,
        type: 'info'
      })
    },
    handleDelete(row) {
      this.$message({
        message: `删除关系：${row.name}`,
        type: 'warning'
      })
    },
    handleCreate() {
      this.createDialogVisible = true
    },
    addMapping() {
      this.relationForm.mappings.push({
        sourceField: '',
        targetField: '',
        type: '',
        description: ''
      })
    },
    removeMapping(index) {
      this.relationForm.mappings.splice(index, 1)
    },
    submitRelation() {
      this.$message({
        message: '关系创建成功',
        type: 'success'
      })
      this.createDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.relation-container {
  padding: 20px;
}

.relation-card {
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

.relation-content {
  h3 {
    margin-bottom: 15px;
    font-weight: 500;
    color: #303133;
  }
}

.mapping-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style> 