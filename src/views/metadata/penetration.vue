<template>
  <div class="metadata-penetration">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">元数据穿透治理</h2>
        <div class="page-desc">管理元数据，包括数据定义、来源、关系等，方便数据的理解和使用。</div>
      </div>
      <div class="header-right">
        <el-input placeholder="搜索元数据" v-model="searchQuery" prefix-icon="el-icon-search" class="search-input" clearable />
        <el-button-group>
          <el-button type="primary" icon="el-icon-plus" @click="showAddMetadata">新增元数据</el-button>
          <el-button type="success" icon="el-icon-share" @click="analyzeRelations">血缘分析</el-button>
          <el-button icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 统计卡片区 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card card-primary">
            <div class="stat-icon"><i class="el-icon-s-data"></i></div>
            <div class="stat-content">
              <div class="stat-label">元数据总数</div>
              <div class="stat-value">1200</div>
              <div class="stat-trend"><span class="trend-up">+15</span> 本月</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-success">
            <div class="stat-icon"><i class="el-icon-s-check"></i></div>
            <div class="stat-content">
              <div class="stat-label">录入准确率</div>
              <div class="stat-value">100%</div>
              <div class="stat-trend"><span class="trend-up">+2%</span> 同比</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-warning">
            <div class="stat-icon"><i class="el-icon-time"></i></div>
            <div class="stat-content">
              <div class="stat-label">平均查询时长</div>
              <div class="stat-value">3秒</div>
              <div class="stat-trend"><span class="trend-down">-0.5秒</span> 优化</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-info">
            <div class="stat-icon"><i class="el-icon-connection"></i></div>
            <div class="stat-content">
              <div class="stat-label">关联关系数</div>
              <div class="stat-value">568</div>
              <div class="stat-trend"><span class="trend-up">+22</span> 本周</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 内容区 -->
    <div class="content-section">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="元数据管理" name="metadata">
          <div class="filter-bar">
            <el-select v-model="typeFilter" placeholder="元数据类型" clearable>
              <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="状态" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="text" icon="el-icon-refresh" @click="resetFilters">重置筛选</el-button>
          </div>
          
          <el-table :data="filteredTableData" style="width:100%" border stripe>
            <el-table-column prop="name" label="元数据名称" min-width="150">
              <template slot-scope="scope">
                <el-link type="primary" @click="viewMetadataDetail(scope.row)">{{ scope.row.name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="数据来源" width="140" />
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getTypeTagClass(scope.row.type)" size="medium">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="relation" label="关联关系" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusTagClass(scope.row.status)" size="medium">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateBy" label="责任人" width="120" />
            <el-table-column prop="lastUpdate" label="最近更新时间" width="160" />
            <el-table-column label="操作" width="240" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" @click="editMetadata(scope.row)">编辑</el-button>
                <el-button size="mini" type="success" @click="viewLineage(scope.row)">血缘</el-button>
                <el-button size="mini" type="danger" @click="deleteMetadata(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredTableData.length"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="血缘分析" name="lineage">
          <div class="lineage-toolbar">
            <el-select v-model="selectedMetadata" placeholder="选择元数据" style="width: 220px;" @change="generateLineage">
              <el-option
                v-for="item in tableData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <div class="toolbar-actions">
              <el-radio-group v-model="lineageDirection" size="small" @change="generateLineage">
                <el-radio-button label="upstream">上游</el-radio-button>
                <el-radio-button label="downstream">下游</el-radio-button>
                <el-radio-button label="both">全部</el-radio-button>
              </el-radio-group>
              <el-select v-model="lineageDepth" style="width: 120px; margin-left: 10px;" @change="generateLineage">
                <el-option label="1级关系" :value="1" />
                <el-option label="2级关系" :value="2" />
                <el-option label="3级关系" :value="3" />
                <el-option label="全部关系" :value="0" />
              </el-select>
            </div>
          </div>
          
          <div class="lineage-container">
            <div class="no-data" v-if="!selectedMetadata">
              <i class="el-icon-connection"></i>
              <p>请选择元数据以查看血缘关系</p>
            </div>
            <div ref="lineageChart" class="lineage-chart" v-else></div>
          </div>
          
          <div class="lineage-info" v-if="selectedMetadata">
            <el-card class="info-card">
              <div slot="header">
                <span>血缘分析信息</span>
              </div>
              <div class="info-content">
                <div class="info-item">
                  <span class="item-label">选中元数据：</span>
                  <span class="item-value">{{ getMetadataName(selectedMetadata) }}</span>
                </div>
                <div class="info-item">
                  <span class="item-label">上游节点数：</span>
                  <span class="item-value">3</span>
                </div>
                <div class="info-item">
                  <span class="item-label">下游节点数：</span>
                  <span class="item-value">2</span>
                </div>
                <div class="info-item">
                  <span class="item-label">关系路径数：</span>
                  <span class="item-value">5</span>
                </div>
                <div class="info-item">
                  <span class="item-label">最大路径长度：</span>
                  <span class="item-value">3</span>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 元数据详情对话框 -->
    <el-dialog :visible.sync="detailVisible" width="70%" :title="currentMetadata.name + ' - 元数据详情'" center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="元数据名称">{{ currentMetadata.name }}</el-descriptions-item>
        <el-descriptions-item label="数据来源">{{ currentMetadata.source }}</el-descriptions-item>
        <el-descriptions-item label="元数据类型">{{ currentMetadata.type }}</el-descriptions-item>
        <el-descriptions-item label="数据大小">{{ currentMetadata.dataSize }}</el-descriptions-item>
        <el-descriptions-item label="关联关系">{{ currentMetadata.relation }}</el-descriptions-item>
        <el-descriptions-item label="更新频率">{{ currentMetadata.frequency }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentMetadata.status }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ currentMetadata.updateBy }}</el-descriptions-item>
        <el-descriptions-item label="最近更新时间">{{ currentMetadata.lastUpdate }}</el-descriptions-item>
        <el-descriptions-item label="描述信息" :span="2">{{ currentMetadata.description }}</el-descriptions-item>
      </el-descriptions>
      
      <el-tabs style="margin-top: 20px;">
        <el-tab-pane label="字段信息">
          <el-table :data="currentFields" border>
            <el-table-column prop="name" label="字段名称" />
            <el-table-column prop="type" label="数据类型" width="120" />
            <el-table-column prop="isPrimary" label="主键" width="80">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.isPrimary" type="danger" size="mini">是</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="isNull" label="允许空" width="80">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.isNull" type="info" size="mini">是</el-tag>
                <el-tag v-else type="danger" size="mini">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="comment" label="字段说明" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="血缘关系">
          <div ref="detailLineageChart" style="height: 300px;"></div>
        </el-tab-pane>
        <el-tab-pane label="质量检测">
          <el-table :data="qualityRecords" border>
            <el-table-column prop="date" label="检测日期" width="120" />
            <el-table-column prop="completeness" label="完整性" width="120">
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.completeness" :color="getQualityColor(scope.row.completeness)"></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="accuracy" label="准确性" width="120">
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.accuracy" :color="getQualityColor(scope.row.accuracy)"></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="consistency" label="一致性" width="120">
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.consistency" :color="getQualityColor(scope.row.consistency)"></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="issues" label="问题数" width="100" />
            <el-table-column prop="status" label="处理状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '已处理' ? 'success' : 'warning'" size="mini">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog :visible.sync="editVisible" width="600px" :title="isNewMetadata ? '新增元数据' : '编辑元数据'" center>
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="元数据名称">
          <el-input v-model="editForm.name" placeholder="请输入元数据名称" />
        </el-form-item>
        <el-form-item label="数据来源">
          <el-input v-model="editForm.source" placeholder="请输入数据来源" />
        </el-form-item>
        <el-form-item label="元数据类型">
          <el-select v-model="editForm.type" placeholder="请选择元数据类型">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联关系">
          <el-input v-model="editForm.relation" placeholder="请输入关联关系" />
        </el-form-item>
        <el-form-item label="数据大小">
          <el-input v-model="editForm.dataSize" placeholder="请输入数据大小" />
        </el-form-item>
        <el-form-item label="更新频率">
          <el-select v-model="editForm.frequency" placeholder="请选择更新频率">
            <el-option label="实时更新" value="实时更新" />
            <el-option label="小时更新" value="小时更新" />
            <el-option label="日更新" value="日更新" />
            <el-option label="周更新" value="周更新" />
            <el-option label="月更新" value="月更新" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="责任人">
          <el-input v-model="editForm.updateBy" placeholder="请输入责任人" />
        </el-form-item>
        <el-form-item label="描述信息">
          <el-input type="textarea" v-model="editForm.description" rows="4" placeholder="请输入描述信息" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMetadata">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'MetadataPenetration',
  data() {
    return {
      searchQuery: '',
      typeFilter: '',
      statusFilter: '',
      activeTab: 'metadata',
      currentPage: 1,
      pageSize: 10,
      
      typeOptions: [
        { value: '主题数据', label: '主题数据' },
        { value: '业务数据', label: '业务数据' },
        { value: '基础数据', label: '基础数据' },
        { value: '外部数据', label: '外部数据' },
        { value: '衍生数据', label: '衍生数据' }
      ],
      
      statusOptions: [
        { value: '已确认', label: '已确认' },
        { value: '待确认', label: '待确认' },
        { value: '审核中', label: '审核中' },
        { value: '已废弃', label: '已废弃' }
      ],
      
      selectedMetadata: null,
      lineageDirection: 'both',
      lineageDepth: 2,
      
      detailVisible: false,
      currentMetadata: {},
      currentFields: [],
      qualityRecords: [],
      
      editVisible: false,
      isNewMetadata: false,
      editForm: {
        name: '',
        source: '',
        type: '',
        relation: '',
        dataSize: '',
        frequency: '',
        status: '',
        updateBy: '',
        description: ''
      },
      tableData: [
        { 
          id: 1,
          name: '人口表', 
          source: '公安局数据中心', 
          type: '主题数据',
          relation: '关联企业表', 
          lastUpdate: '2025-05-30',
          updateBy: '张明轩',
          status: '已确认',
          description: '包含全市人口基本信息、人口变动信息等',
          dataSize: '1.2TB',
          frequency: '日更新'
        },
        { 
          id: 2,
          name: '企业表', 
          source: '市场监管局', 
          type: '主题数据',
          relation: '关联人口表', 
          lastUpdate: '2025-05-30',
          updateBy: '刘伟峰',
          status: '已确认',
          description: '包含企业基本信息、经营信息、资质信息等',
          dataSize: '860GB',
          frequency: '日更新'
        },
        { 
          id: 3,
          name: '环境监测表', 
          source: '环保局', 
          type: '业务数据',
          relation: '关联企业表', 
          lastUpdate: '2025-05-30',
          updateBy: '陈晓静',
          status: '已确认',
          description: '包含空气质量、水质、噪音等环境监测数据',
          dataSize: '520GB',
          frequency: '小时更新'
        },
        { 
          id: 4,
          name: '交通流量表', 
          source: '交通局', 
          type: '业务数据',
          relation: '关联地理信息表', 
          lastUpdate: '2025-05-29',
          updateBy: '杨宏达',
          status: '待确认',
          description: '包含道路交通流量、拥堵指数等实时交通数据',
          dataSize: '750GB',
          frequency: '实时更新'
        },
        { 
          id: 5,
          name: '医疗服务表', 
          source: '卫健委', 
          type: '业务数据',
          relation: '关联人口表', 
          lastUpdate: '2025-05-28',
          updateBy: '林婉如',
          status: '审核中',
          description: '包含医疗机构、医疗服务、医保数据等信息',
          dataSize: '980GB',
          frequency: '日更新'
        }
      ]
    }
  },
  computed: {
    filteredTableData() {
      if (!this.searchQuery && !this.typeFilter && !this.statusFilter) return this.tableData;
      return this.tableData.filter(item => {
        const matchSearch = !this.searchQuery || 
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (item.source && item.source.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (item.relation && item.relation.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        const matchType = !this.typeFilter || item.type === this.typeFilter;
        const matchStatus = !this.statusFilter || item.status === this.statusFilter;
        
        return matchSearch && matchType && matchStatus;
      });
    }
  },
  mounted() {
    if (this.activeTab === 'lineage' && this.selectedMetadata) {
      this.$nextTick(() => {
        this.generateLineage();
      });
    }
  },
  methods: {
    showAddMetadata() {
      this.isNewMetadata = true;
      this.editForm = {
        name: '',
        source: '',
        type: '业务数据',
        relation: '',
        dataSize: '',
        frequency: '日更新',
        status: '待确认',
        updateBy: '',
        description: ''
      };
      this.editVisible = true;
    },
    
    analyzeRelations() {
      this.activeTab = 'lineage';
      this.$message.success('正在分析元数据血缘关系');
      this.$nextTick(() => {
        if (this.selectedMetadata) {
          this.generateLineage();
        }
      });
    },
    
    refreshData() {
      this.$message.success('数据已刷新');
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.typeFilter = '';
      this.statusFilter = '';
    },
    
    handleSizeChange(val) {
      this.pageSize = val;
    },
    
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    
    getTypeTagClass(type) {
      const map = {
        '主题数据': 'primary',
        '业务数据': 'success',
        '基础数据': 'info',
        '外部数据': 'warning',
        '衍生数据': 'danger'
      };
      return map[type] || 'info';
    },
    
    getStatusTagClass(status) {
      const map = {
        '已确认': 'success',
        '待确认': 'warning',
        '审核中': 'info',
        '已废弃': 'danger'
      };
      return map[status] || 'info';
    },
    
    getQualityColor(value) {
      if (value >= 90) return '#67C23A';
      if (value >= 75) return '#E6A23C';
      return '#F56C6C';
    },
    
    viewMetadataDetail(row) {
      this.currentMetadata = row;
      
      // 模拟字段数据
      this.currentFields = [
        { name: 'id', type: 'varchar(32)', isPrimary: true, isNull: false, comment: '唯一标识' },
        { name: 'name', type: 'varchar(100)', isPrimary: false, isNull: false, comment: '名称' },
        { name: 'age', type: 'int', isPrimary: false, isNull: true, comment: '年龄' },
        { name: 'gender', type: 'tinyint', isPrimary: false, isNull: true, comment: '性别' },
        { name: 'address', type: 'varchar(200)', isPrimary: false, isNull: true, comment: '地址' },
        { name: 'phone', type: 'varchar(20)', isPrimary: false, isNull: true, comment: '电话' },
        { name: 'createTime', type: 'datetime', isPrimary: false, isNull: false, comment: '创建时间' },
        { name: 'updateTime', type: 'datetime', isPrimary: false, isNull: false, comment: '更新时间' }
      ];
      
      // 模拟质量检测记录
      this.qualityRecords = [
        { date: '2025-06-01', completeness: 98, accuracy: 95, consistency: 97, issues: 12, status: '已处理' },
        { date: '2025-05-25', completeness: 96, accuracy: 94, consistency: 95, issues: 18, status: '已处理' },
        { date: '2025-05-18', completeness: 95, accuracy: 92, consistency: 93, issues: 22, status: '已处理' },
        { date: '2025-05-11', completeness: 93, accuracy: 91, consistency: 92, issues: 28, status: '已处理' }
      ];
      
      this.detailVisible = true;
      
      this.$nextTick(() => {
        this.initDetailLineageChart();
      });
    },
    
    editMetadata(row) {
      this.isNewMetadata = false;
      this.editForm = {
        id: row.id,
        name: row.name,
        source: row.source,
        type: row.type,
        relation: row.relation,
        dataSize: row.dataSize,
        frequency: row.frequency,
        status: row.status,
        updateBy: row.updateBy,
        description: row.description
      };
      this.editVisible = true;
    },
    
    deleteMetadata(row) {
      this.$confirm('确定要删除此元数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableData = this.tableData.filter(item => item.id !== row.id);
        this.$message.success('元数据已删除');
      }).catch(() => {});
    },
    
    saveMetadata() {
      if (!this.editForm.name || !this.editForm.source) {
        this.$message.warning('请填写完整的元数据信息');
        return;
      }
      
      const metadataData = {
        id: this.editForm.id || Date.now(),
        name: this.editForm.name,
        source: this.editForm.source,
        type: this.editForm.type,
        relation: this.editForm.relation,
        dataSize: this.editForm.dataSize,
        frequency: this.editForm.frequency,
        status: this.editForm.status,
        updateBy: this.editForm.updateBy,
        lastUpdate: new Date().toISOString().split('T')[0],
        description: this.editForm.description
      };
      
      if (this.isNewMetadata) {
        this.tableData.unshift(metadataData);
        this.$message.success('元数据已添加');
      } else {
        const index = this.tableData.findIndex(item => item.id === metadataData.id);
        if (index !== -1) {
          this.tableData.splice(index, 1, metadataData);
        }
        this.$message.success('元数据已更新');
      }
      
      this.editVisible = false;
    },
    
    viewLineage(row) {
      this.selectedMetadata = row.id;
      this.activeTab = 'lineage';
      this.$nextTick(() => {
        this.generateLineage();
      });
    },
    
    getMetadataName(id) {
      const metadata = this.tableData.find(item => item.id === id);
      return metadata ? metadata.name : '';
    },
    
    generateLineage() {
      if (!this.selectedMetadata) return;
      
      this.$nextTick(() => {
        // 初始化血缘图
        const chart = echarts.init(this.$refs.lineageChart);
        
        // 模拟血缘关系数据
        const nodes = [
          { id: 'node0', name: this.getMetadataName(this.selectedMetadata), category: 0, symbolSize: 50 },
          { id: 'node1', name: '人口表', category: 1, symbolSize: 40 },
          { id: 'node2', name: '企业表', category: 1, symbolSize: 40 },
          { id: 'node3', name: '地址表', category: 1, symbolSize: 35 },
          { id: 'node4', name: '资质表', category: 2, symbolSize: 35 },
          { id: 'node5', name: '交易表', category: 2, symbolSize: 35 },
          { id: 'node6', name: '员工表', category: 2, symbolSize: 30 }
        ];
        
        const links = [
          { source: 'node0', target: 'node1', value: '包含' },
          { source: 'node0', target: 'node2', value: '关联' },
          { source: 'node1', target: 'node3', value: '包含' },
          { source: 'node2', target: 'node4', value: '包含' },
          { source: 'node2', target: 'node5', value: '关联' },
          { source: 'node4', target: 'node6', value: '关联' }
        ];
        
        const categories = [
          { name: '当前元数据' },
          { name: '上游元数据' },
          { name: '下游元数据' }
        ];
        
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: function(params) {
              if (params.dataType === 'edge') {
                return params.data.value;
              }
              return params.data.name;
            }
          },
          legend: [{
            data: categories.map(function(a) {
              return a.name;
            })
          }],
          series: [{
            type: 'graph',
            layout: 'force',
            data: nodes,
            links: links,
            categories: categories,
            roam: true,
            label: {
              show: true,
              position: 'right'
            },
            force: {
              repulsion: 100,
              edgeLength: [80, 120]
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 8],
            edgeLabel: {
              show: true,
              formatter: function(params) {
                return params.data.value;
              },
              fontSize: 12
            },
            lineStyle: {
              opacity: 0.9,
              width: 2,
              curveness: 0
            }
          }]
        };
        
        chart.setOption(option);
        
        // 自适应窗口大小
        window.addEventListener('resize', function() {
          chart.resize();
        });
      });
    },
    
    initDetailLineageChart() {
      this.$nextTick(() => {
        if (!this.$refs.detailLineageChart) return;
        
        const chart = echarts.init(this.$refs.detailLineageChart);
        
        // 简化的血缘图，针对当前查看的元数据
        const option = {
          tooltip: {},
          series: [{
            type: 'graph',
            layout: 'force',
            data: [
              { id: 'detail0', name: this.currentMetadata.name, symbolSize: 50, category: 0 },
              { id: 'detail1', name: '上游数据1', symbolSize: 30, category: 1 },
              { id: 'detail2', name: '上游数据2', symbolSize: 30, category: 1 },
              { id: 'detail3', name: '下游数据1', symbolSize: 30, category: 2 },
              { id: 'detail4', name: '下游数据2', symbolSize: 30, category: 2 }
            ],
            links: [
              { source: 'detail1', target: 'detail0' },
              { source: 'detail2', target: 'detail0' },
              { source: 'detail0', target: 'detail3' },
              { source: 'detail0', target: 'detail4' }
            ],
            categories: [
              { name: '当前' },
              { name: '上游' },
              { name: '下游' }
            ],
            roam: true,
            label: {
              show: true
            },
            force: {
              repulsion: 80
            }
          }]
        };
        
        chart.setOption(option);
      });
    }
  },
  watch: {
    activeTab(newVal) {
      if (newVal === 'lineage' && this.selectedMetadata) {
        this.$nextTick(() => {
          this.generateLineage();
        });
      }
    }
  }
}
</script>

<style scoped>
.metadata-penetration {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面标题样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.search-input {
  width: 220px;
  margin-right: 16px;
}

/* 统计卡片样式 */
.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border-radius: 4px;
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.card-primary {
  border-left: 4px solid #409EFF;
}

.card-success {
  border-left: 4px solid #67C23A;
}

.card-warning {
  border-left: 4px solid #E6A23C;
}

.card-info {
  border-left: 4px solid #909399;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #409EFF;
}

.card-primary .stat-icon {
  background: #ecf5ff;
  color: #409EFF;
}

.card-success .stat-icon {
  background: #f0f9eb;
  color: #67C23A;
}

.card-warning .stat-icon {
  background: #fdf6ec;
  color: #E6A23C;
}

.card-info .stat-icon {
  background: #f4f4f5;
  color: #909399;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  color: #909399;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

/* 内容区样式 */
.content-section {
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

/* 表格操作区 */
.filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.filter-bar .el-select {
  margin-right: 16px;
  width: 150px;
}

/* 分页 */
.pagination-container {
  margin-top: 16px;
  text-align: right;
}

/* 血缘分析相关样式 */
.lineage-toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lineage-container {
  height: 500px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  position: relative;
}

.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.no-data i {
  font-size: 48px;
  color: #dcdfe6;
  margin-bottom: 10px;
}

.no-data p {
  color: #909399;
  font-size: 14px;
}

.lineage-chart {
  width: 100%;
  height: 100%;
}

.lineage-info {
  margin-top: 20px;
}

.info-card .info-content {
  padding: 10px;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
}

.item-label {
  width: 100px;
  color: #909399;
}

.item-value {
  flex: 1;
  color: #303133;
  font-weight: bold;
}
</style> 