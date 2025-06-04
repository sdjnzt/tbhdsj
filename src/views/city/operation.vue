<template>
  <div class="city-operation">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">城市运营监测</h2>
        <div class="page-desc">实时监测城市基础设施、公共服务等运行状况，为城市管理提供决策支持。</div>
      </div>
      <div class="header-right">
        <el-input placeholder="搜索设施" v-model="searchQuery" prefix-icon="el-icon-search" class="search-input" clearable />
        <el-button-group>
          <el-button type="primary" icon="el-icon-plus" @click="showAddFacility">添加设施</el-button>
          <el-button type="success" icon="el-icon-bell" @click="viewAlerts">查看告警</el-button>
          <el-button icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 概览统计区域 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card card-primary">
            <div class="stat-icon"><i class="el-icon-monitor"></i></div>
            <div class="stat-content">
              <div class="stat-label">监测设施数</div>
              <div class="stat-value">{{facilityStats.total}}</div>
              <div class="stat-trend"><span class="trend-up">+2</span> 本月</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-success">
            <div class="stat-icon"><i class="el-icon-s-operation"></i></div>
            <div class="stat-content">
              <div class="stat-label">正常运行率</div>
              <div class="stat-value">{{facilityStats.normalRate}}%</div>
              <div class="stat-trend"><span class="trend-up">+1.5%</span> 同比</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-warning">
            <div class="stat-icon"><i class="el-icon-warning-outline"></i></div>
            <div class="stat-content">
              <div class="stat-label">当前告警数</div>
              <div class="stat-value">{{facilityStats.alerts}}</div>
              <div class="stat-trend"><span class="trend-down">-5</span> 本周</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-info">
            <div class="stat-icon"><i class="el-icon-time"></i></div>
            <div class="stat-content">
              <div class="stat-label">异常响应时效</div>
              <div class="stat-value">{{facilityStats.responseTime}}分钟</div>
              <div class="stat-trend"><span class="trend-down">-45分钟</span> 优化</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 实时监控面板 -->
    <div class="monitoring-panel">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="map-card">
            <div slot="header" class="clearfix">
              <span>城市设施地理分布</span>
              <el-radio-group v-model="mapViewMode" size="mini" style="float: right">
                <el-radio-button label="normal">常规视图</el-radio-button>
                <el-radio-button label="heat">热力视图</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="facilityMap" class="facility-map"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="alert-card">
            <div slot="header" class="clearfix">
              <span>实时告警</span>
              <el-button style="float: right; padding: 3px 0" type="text" @click="viewAllAlerts">查看全部</el-button>
            </div>
            <div class="real-time-alerts">
              <div v-if="recentAlerts.length === 0" class="no-alerts">
                <i class="el-icon-success"></i>
                <p>暂无告警信息</p>
              </div>
              <div v-else class="alert-list">
                <div v-for="(alert, index) in recentAlerts" :key="index" 
                     class="alert-item" 
                     :class="{'critical': alert.level === '严重', 'warning': alert.level === '警告', 'info': alert.level === '一般'}">
                  <div class="alert-time">{{alert.time}}</div>
                  <div class="alert-content">
                    <div class="alert-title">
                      <el-tag size="mini" :type="getAlertLevelType(alert.level)">{{alert.level}}</el-tag>
                      {{alert.facility}}
                    </div>
                    <div class="alert-desc">{{alert.content}}</div>
                  </div>
                  <div class="alert-actions">
                    <el-button size="mini" type="primary" @click="handleAlert(alert)">处理</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 设施监控数据 -->
    <div class="content-section">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="设施监测明细" name="facilities">
          <div class="filter-bar">
            <el-select v-model="typeFilter" placeholder="设施类型" clearable>
              <el-option v-for="item in facilityTypes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="运行状态" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="text" icon="el-icon-refresh" @click="resetFilters">重置筛选</el-button>
          </div>
          
          <el-table :data="filteredFacilities" style="width:100%" border stripe>
            <el-table-column prop="code" label="编号" width="100" />
            <el-table-column prop="name" label="设施名称" min-width="150">
              <template slot-scope="scope">
                <el-link type="primary" @click="viewFacilityDetail(scope.row)">{{ scope.row.name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="设施类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getTypeTagClass(scope.row.type)" size="medium">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="位置" width="120" />
            <el-table-column prop="load" label="负载率" width="180">
              <template slot-scope="scope">
                <el-progress :percentage="parseInt(scope.row.load)" :status="getLoadStatus(scope.row.load)"></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="lastUpdate" label="更新时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusTagClass(scope.row.status)" size="medium">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" @click="monitorFacility(scope.row)">监控</el-button>
                <el-button size="mini" type="success" @click="viewTrend(scope.row)">趋势</el-button>
                <el-button size="mini" type="danger" @click="handleFacilityAlert(scope.row)" v-if="scope.row.status === '异常'">处理</el-button>
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
              :total="filteredFacilities.length"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="数据分析" name="analysis">
          <div class="analysis-container">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card class="chart-card" shadow="hover">
                  <div slot="header" class="chart-header">
                    <span><i class="el-icon-pie-chart"></i> 设施类型分布</span>
                  </div>
                  <div ref="typeChart" class="chart-container"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card class="chart-card" shadow="hover">
                  <div slot="header" class="chart-header">
                    <span><i class="el-icon-warning"></i> 告警趋势分析</span>
                  </div>
                  <div ref="alertTrendChart" class="chart-container"></div>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="12">
                <el-card class="chart-card" shadow="hover">
                  <div slot="header" class="chart-header">
                    <span><i class="el-icon-data-line"></i> 平均负载率</span>
                  </div>
                  <div ref="loadChart" class="chart-container"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card class="chart-card" shadow="hover">
                  <div slot="header" class="chart-header">
                    <span><i class="el-icon-time"></i> 响应时间分析</span>
                  </div>
                  <div ref="responseTimeChart" class="chart-container"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 设施详情对话框 -->
    <el-dialog :visible.sync="detailVisible" width="70%" :title="currentFacility.name + ' - 设施详情'" center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="设施名称">{{ currentFacility.name }}</el-descriptions-item>
        <el-descriptions-item label="设施编号">{{ currentFacility.code }}</el-descriptions-item>
        <el-descriptions-item label="设施类型">{{ currentFacility.type }}</el-descriptions-item>
        <el-descriptions-item label="运行状态">{{ currentFacility.status }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ currentFacility.location }}</el-descriptions-item>
        <el-descriptions-item label="负载率">{{ currentFacility.load }}%</el-descriptions-item>
        <el-descriptions-item label="最近更新">{{ currentFacility.lastUpdate }}</el-descriptions-item>
        <el-descriptions-item label="负责部门">{{ currentFacility.department }}</el-descriptions-item>
        <el-descriptions-item label="设施描述" :span="2">{{ currentFacility.description }}</el-descriptions-item>
      </el-descriptions>
      
      <el-tabs style="margin-top: 20px;">
        <el-tab-pane label="实时数据">
          <el-row :gutter="20">
            <el-col :span="12">
              <div ref="realTimeChart" style="height: 300px;"></div>
            </el-col>
            <el-col :span="12">
              <el-card class="parameter-card">
                <div slot="header">运行参数</div>
                <div class="parameter-list">
                  <div class="parameter-item">
                    <span class="parameter-label">运行时长:</span>
                    <span class="parameter-value">{{ currentFacility.runtime || '720小时' }}</span>
                  </div>
                  <div class="parameter-item">
                    <span class="parameter-label">当前负载:</span>
                    <span class="parameter-value">{{ currentFacility.load || '65' }}%</span>
                  </div>
                  <div class="parameter-item">
                    <span class="parameter-label">能耗:</span>
                    <span class="parameter-value">{{ currentFacility.power || '120' }}kWh</span>
                  </div>
                  <div class="parameter-item">
                    <span class="parameter-label">温度:</span>
                    <span class="parameter-value">{{ currentFacility.temperature || '35' }}°C</span>
                  </div>
                  <div class="parameter-item">
                    <span class="parameter-label">湿度:</span>
                    <span class="parameter-value">{{ currentFacility.humidity || '45' }}%</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="历史告警">
          <el-table :data="facilityAlerts" border>
            <el-table-column prop="time" label="告警时间" width="180" />
            <el-table-column prop="level" label="告警级别" width="100">
              <template slot-scope="scope">
                <el-tag :type="getAlertLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="告警内容" />
            <el-table-column prop="duration" label="持续时间" width="100" />
            <el-table-column prop="status" label="处理状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '已处理' ? 'success' : 'warning'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="handler" label="处理人" width="100" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 实时监控对话框 -->
    <el-dialog :visible.sync="monitorVisible" width="80%" title="实时监控" center>
      <div v-if="currentFacility" class="monitor-container">
        <div class="monitor-header">
          <h3>{{ currentFacility.name }} <el-tag :type="getStatusTagClass(currentFacility.status)">{{ currentFacility.status }}</el-tag></h3>
          <div class="update-info">上次更新: {{ new Date().toLocaleTimeString() }}</div>
        </div>
        
        <el-row :gutter="20" class="monitor-content">
          <el-col :span="16">
            <div ref="monitorChart" class="monitor-chart"></div>
          </el-col>
          <el-col :span="8">
            <div class="parameter-panel">
              <div class="parameter-group">
                <div class="group-title">基本参数</div>
                <div class="group-content">
                  <el-row :gutter="10">
                    <el-col :span="12">
                      <div class="parameter-card">
                        <div class="parameter-name">负载率</div>
                        <div class="parameter-value">{{ currentFacility.load }}%</div>
                        <el-progress :percentage="parseInt(currentFacility.load)" :status="getLoadStatus(currentFacility.load)"></el-progress>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="parameter-card">
                        <div class="parameter-name">温度</div>
                        <div class="parameter-value">{{ currentFacility.temperature || '35' }}°C</div>
                        <el-progress :percentage="parseInt(currentFacility.temperature || '35')" :status="getTemperatureStatus(currentFacility.temperature || '35')"></el-progress>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="10" style="margin-top: 10px;">
                    <el-col :span="12">
                      <div class="parameter-card">
                        <div class="parameter-name">能耗</div>
                        <div class="parameter-value">{{ currentFacility.power || '120' }}kWh</div>
                        <el-progress :percentage="parseInt(currentFacility.power || '120')/2" status="success"></el-progress>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="parameter-card">
                        <div class="parameter-name">湿度</div>
                        <div class="parameter-value">{{ currentFacility.humidity || '45' }}%</div>
                        <el-progress :percentage="parseInt(currentFacility.humidity || '45')" status="success"></el-progress>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
              
              <div class="action-panel">
                <el-button type="primary" icon="el-icon-video-camera" @click="toggleVideo">视频监控</el-button>
                <el-button type="warning" icon="el-icon-bell" @click="testAlarm">测试告警</el-button>
                <el-button type="success" icon="el-icon-download" @click="exportData">导出数据</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <!-- 添加设施对话框 -->
    <el-dialog :visible.sync="addVisible" width="600px" title="添加监测设施" center>
      <el-form :model="facilityForm" label-width="100px">
        <el-form-item label="设施名称">
          <el-input v-model="facilityForm.name" placeholder="请输入设施名称" />
        </el-form-item>
        <el-form-item label="设施类型">
          <el-select v-model="facilityForm.type" placeholder="请选择设施类型">
            <el-option v-for="item in facilityTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="facilityForm.location" placeholder="请输入设施位置" />
        </el-form-item>
        <el-form-item label="负责部门">
          <el-input v-model="facilityForm.department" placeholder="请输入负责部门" />
        </el-form-item>
        <el-form-item label="设施描述">
          <el-input type="textarea" v-model="facilityForm.description" rows="4" placeholder="请输入设施描述" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFacility">保存</el-button>
      </span>
    </el-dialog>

    <!-- 告警处理对话框 -->
    <el-dialog :visible.sync="alertVisible" width="600px" title="告警处理" center>
      <div v-if="currentAlert" class="alert-detail">
        <el-alert
          :title="currentAlert.level + '告警'"
          :type="getAlertLevelType(currentAlert.level)"
          :description="currentAlert.content"
          show-icon
          :closable="false"
        ></el-alert>
        
        <div class="alert-info">
          <p><strong>设施名称:</strong> {{ currentAlert.facility }}</p>
          <p><strong>告警时间:</strong> {{ currentAlert.time }}</p>
          <p><strong>设施位置:</strong> {{ currentAlert.location }}</p>
        </div>
        
        <el-form :model="alertForm" label-width="100px" class="alert-form">
          <el-form-item label="处理方式">
            <el-select v-model="alertForm.method" placeholder="请选择处理方式">
              <el-option label="远程处理" value="远程处理"></el-option>
              <el-option label="现场处理" value="现场处理"></el-option>
              <el-option label="转交专家" value="转交专家"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="处理人">
            <el-input v-model="alertForm.handler" placeholder="请输入处理人姓名"></el-input>
          </el-form-item>
          <el-form-item label="处理记录">
            <el-input type="textarea" v-model="alertForm.remark" rows="3" placeholder="请输入处理记录"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alertVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlertHandler">确认处理</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import { mapState } from 'vuex'

export default {
  name: 'CityOperation',
  data() {
    return {
      searchQuery: '',
      typeFilter: '',
      statusFilter: '',
      activeTab: 'facilities',
      currentPage: 1,
      pageSize: 10,
      mapViewMode: 'normal',
      
      // 统计数据
      facilityStats: {
        total: 15,
        normalRate: 92,
        alerts: 3,
        responseTime: 15
      },
      
      // 设施类型选项
      facilityTypes: [
        { value: '交通设施', label: '交通设施' },
        { value: '水务设施', label: '水务设施' },
        { value: '电力设施', label: '电力设施' },
        { value: '环保设施', label: '环保设施' },
        { value: '通信设施', label: '通信设施' },
        { value: '照明设施', label: '照明设施' },
        { value: '公共安全', label: '公共安全' }
      ],
      
      // 状态选项
      statusOptions: [
        { value: '正常', label: '正常' },
        { value: '异常', label: '异常' },
        { value: '维护中', label: '维护中' },
        { value: '待检修', label: '待检修' }
      ],
      
      // 对话框状态
      detailVisible: false,
      monitorVisible: false,
      addVisible: false,
      alertVisible: false,
      
      // 当前选中的设施和告警
      currentFacility: {},
      currentAlert: null,
      
      // 表单数据
      facilityForm: {
        name: '',
        type: '',
        location: '',
        department: '',
        description: ''
      },
      
      alertForm: {
        method: '远程处理',
        handler: '',
        remark: ''
      },
      
      // 设施数据
      facilities: [
        { 
          code: 'CF001',
          name: '中心区交通信号灯系统', 
          type: '交通设施',
          location: '市中心十字路口',
          status: '正常', 
          load: '65',
          lastUpdate: '2025-05-30 10:15:26',
          department: '交通管理局',
          description: '中心区智能交通信号灯系统，负责交通路口信号灯控制',
          runtime: '720小时',
          power: '120',
          temperature: '35',
          humidity: '45'
        },
        { 
          code: 'CF002',
          name: '第一水厂供水系统', 
          type: '水务设施',
          location: '城北新区',
          status: '正常', 
          load: '72',
          lastUpdate: '2025-05-30 10:12:18',
          department: '水务局',
          description: '城市第一水厂供水系统，负责城北区域供水',
          runtime: '1200小时',
          power: '350',
          temperature: '28',
          humidity: '65'
        },
        { 
          code: 'CF003',
          name: '东区变电站', 
          type: '电力设施',
          location: '城东工业园',
          status: '异常', 
          load: '87',
          lastUpdate: '2025-05-30 10:05:42',
          department: '电力局',
          description: '东区主要变电站，负责工业园区供电',
          runtime: '960小时',
          power: '580',
          temperature: '42',
          humidity: '38'
        },
        { 
          code: 'CF004',
          name: '环保监测站', 
          type: '环保设施',
          location: '生态公园',
          status: '正常', 
          load: '58',
          lastUpdate: '2025-05-30 10:08:33',
          department: '环保局',
          description: '城市环境质量监测站，实时监测空气质量',
          runtime: '840小时',
          power: '90',
          temperature: '26',
          humidity: '52'
        },
        { 
          code: 'CF005',
          name: '5G通信基站', 
          type: '通信设施',
          location: '城市中心',
          status: '待检修', 
          load: '78',
          lastUpdate: '2025-05-30 09:55:12',
          department: '通信管理局',
          description: '5G移动通信基站，提供高速移动通信服务',
          runtime: '680小时',
          power: '210',
          temperature: '36',
          humidity: '40'
        },
        { 
          code: 'CF006',
          name: '主干道智能路灯系统', 
          type: '照明设施',
          location: '城市主干道',
          status: '维护中', 
          load: '42',
          lastUpdate: '2025-05-30 09:48:05',
          department: '城管局',
          description: '主干道智能路灯控制系统，支持自动调光',
          runtime: '520小时',
          power: '150',
          temperature: '30',
          humidity: '48'
        },
        { 
          code: 'CF007',
          name: '中心广场监控系统', 
          type: '公共安全',
          location: '城市中心广场',
          status: '正常', 
          load: '62',
          lastUpdate: '2025-05-30 10:02:37',
          department: '公安局',
          description: '中心广场视频监控系统，保障公共安全',
          runtime: '890小时',
          power: '130',
          temperature: '32',
          humidity: '44'
        },
        { 
          code: 'CF008',
          name: '南区水质监测站', 
          type: '水务设施',
          location: '南湖公园',
          status: '异常', 
          load: '83',
          lastUpdate: '2025-05-30 09:38:51',
          department: '水务局',
          description: '南区水质在线监测系统，实时监控水质参数',
          runtime: '720小时',
          power: '110',
          temperature: '38',
          humidity: '75'
        }
      ],
      
      // 告警数据
      recentAlerts: [
        {
          id: 'AL001',
          time: '2025-05-30 10:05:42',
          facility: '东区变电站',
          location: '城东工业园',
          level: '严重',
          content: '负载率超过安全阈值，当前87%',
          status: '待处理'
        },
        {
          id: 'AL002',
          time: '2025-05-30 09:38:51',
          facility: '南区水质监测站',
          location: '南湖公园',
          level: '警告',
          content: '水质浊度参数异常，超出标准范围',
          status: '待处理'
        },
        {
          id: 'AL003',
          time: '2025-05-30 09:15:30',
          facility: '西区交通信号灯',
          location: '西区商业中心',
          level: '一般',
          content: '信号灯控制延迟，响应时间异常',
          status: '处理中'
        }
      ],
      
      // 设施历史告警
      facilityAlerts: [
        { time: '2025-05-28 14:20:15', level: '严重', content: '负载率超过安全阈值，当前91%', duration: '30分钟', status: '已处理', handler: '张工' },
        { time: '2025-05-25 08:45:32', level: '警告', content: '温度过高，达到45°C', duration: '45分钟', status: '已处理', handler: '李工' },
        { time: '2025-05-20 16:12:08', level: '一般', content: '通信信号波动', duration: '15分钟', status: '已处理', handler: '王工' },
        { time: '2025-05-15 10:30:22', level: '警告', content: '电压不稳定', duration: '60分钟', status: '已处理', handler: '刘工' }
      ],
      
      // 添加图表实例存储
      charts: {
        typeChart: null,
        alertTrendChart: null,
        loadChart: null,
        responseTimeChart: null
      }
    }
  },
  computed: {
    ...mapState(['cityData']),
    
    filteredFacilities() {
      if (!this.searchQuery && !this.typeFilter && !this.statusFilter) return this.facilities;
      return this.facilities.filter(item => {
        const matchSearch = !this.searchQuery || 
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (item.location && item.location.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        const matchType = !this.typeFilter || item.type === this.typeFilter;
        const matchStatus = !this.statusFilter || item.status === this.statusFilter;
        
        return matchSearch && matchType && matchStatus;
      });
    }
  },
  mounted() {
    this.initCharts();
    this.initMap();
    
    // 设置自动刷新监控数据
    this.refreshTimer = setInterval(() => {
      this.updateRealTimeData();
    }, 30000); // 每30秒更新一次
    
    // 监听窗口大小变化，重绘图表
    window.addEventListener('resize', this.resizeCharts);
  },
  beforeDestroy() {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    // 移除窗口resize监听
    window.removeEventListener('resize', this.resizeCharts);
    
    // 销毁图表实例
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.dispose();
    });
  },
  methods: {
    initCharts() {
      // 延迟到DOM渲染完成后初始化图表
      setTimeout(() => {
        this.initTypeChart();
        this.initAlertTrendChart();
        this.initLoadChart();
        this.initResponseTimeChart();
        console.log('所有图表初始化完成');
      }, 300);
    },
    
    // 窗口大小变化时重绘图表
    resizeCharts() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          chart.resize();
        }
      });
    },
    
    // 初始化设施类型分布图表
    initTypeChart() {
      if (!this.$refs.typeChart) {
        console.warn('typeChart ref不存在');
        return;
      }
      
      console.log('初始化typeChart', this.$refs.typeChart.offsetHeight);
      
      // 如果已有实例，先销毁
      if (this.charts.typeChart) {
        this.charts.typeChart.dispose();
      }
      
      // 创建新实例
      this.$nextTick(() => {
        this.charts.typeChart = echarts.init(this.$refs.typeChart);
        this.charts.typeChart.setOption({
          title: {
            text: '设施类型分布',
            left: 'center',
            top: 0,
            textStyle: {
              fontSize: 16,
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 10,
            top: 'center',
            data: this.facilityTypes.map(type => type.label)
          },
          series: [
            {
              name: '设施类型',
              type: 'pie',
              radius: ['50%', '70%'],
              center: ['60%', '50%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 3, name: '交通设施', itemStyle: {color: '#409EFF'} },
                { value: 2, name: '水务设施', itemStyle: {color: '#67C23A'} },
                { value: 1, name: '电力设施', itemStyle: {color: '#E6A23C'} },
                { value: 1, name: '环保设施', itemStyle: {color: '#19be6b'} },
                { value: 1, name: '通信设施', itemStyle: {color: '#F56C6C'} },
                { value: 2, name: '照明设施', itemStyle: {color: '#909399'} },
                { value: 1, name: '公共安全', itemStyle: {color: '#9254de'} }
              ]
            }
          ]
        });
        
        // 立即触发resize以确保图表正确渲染
        this.charts.typeChart.resize();
      });
    },
    
    // 初始化告警趋势图表
    initAlertTrendChart() {
      if (!this.$refs.alertTrendChart) {
        console.warn('alertTrendChart ref不存在');
        return;
      }
      
      console.log('初始化alertTrendChart', this.$refs.alertTrendChart.offsetHeight);
      
      // 如果已有实例，先销毁
      if (this.charts.alertTrendChart) {
        this.charts.alertTrendChart.dispose();
      }
      
      // 创建新实例
      this.$nextTick(() => {
        this.charts.alertTrendChart = echarts.init(this.$refs.alertTrendChart);
        this.charts.alertTrendChart.setOption({
          title: {
            text: '告警趋势分析',
            left: 'center',
            textStyle: {
              fontSize: 16,
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['严重告警', '警告告警', '一般告警'],
            bottom: 0
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: {
              lineStyle: {
                color: '#ddd'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#ddd'
              }
            },
            splitLine: {
              lineStyle: {
                color: '#eee'
              }
            }
          },
          series: [
            {
              name: '严重告警',
              type: 'line',
              stack: 'Total',
              data: [2, 1, 3, 2, 1, 0, 1],
              itemStyle: {
                color: '#F56C6C'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(245, 108, 108, 0.5)' },
                  { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
                ])
              },
              smooth: true
            },
            {
              name: '警告告警',
              type: 'line',
              stack: 'Total',
              data: [3, 4, 5, 3, 2, 3, 2],
              itemStyle: {
                color: '#E6A23C'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(230, 162, 60, 0.5)' },
                  { offset: 1, color: 'rgba(230, 162, 60, 0.1)' }
                ])
              },
              smooth: true
            },
            {
              name: '一般告警',
              type: 'line',
              stack: 'Total',
              data: [5, 6, 4, 5, 7, 4, 3],
              itemStyle: {
                color: '#909399'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(144, 147, 153, 0.5)' },
                  { offset: 1, color: 'rgba(144, 147, 153, 0.1)' }
                ])
              },
              smooth: true
            }
          ]
        });
        
        // 立即触发resize以确保图表正确渲染
        this.charts.alertTrendChart.resize();
      });
    },
    
    // 初始化平均负载率图表
    initLoadChart() {
      if (!this.$refs.loadChart) {
        console.warn('loadChart ref不存在');
        return;
      }
      
      console.log('初始化loadChart', this.$refs.loadChart.offsetHeight);
      
      // 如果已有实例，先销毁
      if (this.charts.loadChart) {
        this.charts.loadChart.dispose();
      }
      
      // 创建新实例
      this.$nextTick(() => {
        this.charts.loadChart = echarts.init(this.$refs.loadChart);
        this.charts.loadChart.setOption({
          title: {
            text: '设施平均负载率',
            left: 'center',
            textStyle: {
              fontSize: 16,
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'axis',
            formatter: '{b}<br />{a}: {c}%'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            axisLine: {
              lineStyle: {
                color: '#ddd'
              }
            },
            axisLabel: {
              color: '#666'
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value}%',
              color: '#666'
            },
            axisLine: {
              lineStyle: {
                color: '#ddd'
              }
            },
            splitLine: {
              lineStyle: {
                color: '#eee'
              }
            }
          },
          series: [
            {
              name: '负载率',
              data: [45, 42, 48, 62, 75, 68, 72, 58],
              type: 'line',
              smooth: true,
              lineStyle: {
                width: 4,
                color: '#409EFF'
              },
              itemStyle: {
                color: '#409EFF'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                  { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
                ])
              },
              markLine: {
                data: [
                  {
                    name: '警戒线',
                    yAxis: 80,
                    lineStyle: {
                      color: '#F56C6C',
                      type: 'dashed',
                      width: 2
                    },
                    label: {
                      formatter: '警戒线(80%)',
                      position: 'insideEndTop',
                      color: '#F56C6C',
                      fontSize: 12
                    }
                  }
                ]
              }
            }
          ]
        });
        
        // 立即触发resize以确保图表正确渲染
        this.charts.loadChart.resize();
      });
    },
    
    // 初始化响应时间分析图表
    initResponseTimeChart() {
      if (!this.$refs.responseTimeChart) {
        console.warn('responseTimeChart ref不存在');
        return;
      }
      
      console.log('初始化responseTimeChart', this.$refs.responseTimeChart.offsetHeight);
      
      // 如果已有实例，先销毁
      if (this.charts.responseTimeChart) {
        this.charts.responseTimeChart.dispose();
      }
      
      // 创建新实例
      this.$nextTick(() => {
        this.charts.responseTimeChart = echarts.init(this.$refs.responseTimeChart);
        this.charts.responseTimeChart.setOption({
          title: {
            text: '告警响应时间趋势',
            left: 'center',
            textStyle: {
              fontSize: 16,
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'axis',
            formatter: '{b}<br />{a}: {c}分钟'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月'],
            axisLine: {
              lineStyle: {
                color: '#ddd'
              }
            },
            axisLabel: {
              color: '#666'
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value}分钟',
              color: '#666'
            },
            axisLine: {
              lineStyle: {
                color: '#ddd'
              }
            },
            splitLine: {
              lineStyle: {
                color: '#eee'
              }
            }
          },
          series: [
            {
              data: [60, 50, 40, 30, 20, 15],
              type: 'line',
              name: '平均响应时间',
              smooth: true,
              lineStyle: {
                width: 4,
                color: '#67C23A'
              },
              itemStyle: {
                color: '#67C23A'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(103, 194, 58, 0.5)' },
                  { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
                ])
              },
              markLine: {
                data: [
                  {
                    name: '目标线',
                    yAxis: 15,
                    lineStyle: {
                      color: '#409EFF',
                      type: 'dashed',
                      width: 2
                    },
                    label: {
                      formatter: '目标线(15分钟)',
                      position: 'insideEndTop',
                      color: '#409EFF',
                      fontSize: 12
                    }
                  }
                ]
              }
            }
          ]
        });
        
        // 立即触发resize以确保图表正确渲染
        this.charts.responseTimeChart.resize();
      });
    },
    
    initMap() {
      this.$nextTick(() => {
        if (this.$refs.facilityMap) {
          const mapChart = echarts.init(this.$refs.facilityMap);
          
          // 使用散点图替代地图
          mapChart.setOption({
            title: {
              text: '城市设施分布',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: function(params) {
                return params.name + '<br/>负载率: ' + params.value[2] + '%<br/>状态: ' + params.data.status;
              }
            },
            xAxis: {
              type: 'value',
              name: '经度',
              min: 120.1,
              max: 120.3,
              splitLine: {
                show: true
              }
            },
            yAxis: {
              type: 'value',
              name: '纬度',
              min: 30.2,
              max: 30.4,
              splitLine: {
                show: true
              }
            },
            series: [
              {
                type: 'scatter',
                symbolSize: function(val) {
                  return val[2] / 10 + 5;
                },
                data: [
                  { name: '交通信号灯系统', value: [120.13, 30.28, 65], status: '正常' },
                  { name: '第一水厂供水系统', value: [120.18, 30.35, 72], status: '正常' },
                  { name: '东区变电站', value: [120.22, 30.30, 87], status: '异常' },
                  { name: '环保监测站', value: [120.15, 30.25, 58], status: '正常' },
                  { name: '5G通信基站', value: [120.16, 30.29, 78], status: '待检修' },
                  { name: '智能路灯系统', value: [120.20, 30.32, 42], status: '维护中' },
                  { name: '中心广场监控系统', value: [120.17, 30.31, 62], status: '正常' },
                  { name: '南区水质监测站', value: [120.14, 30.26, 83], status: '异常' }
                ],
                itemStyle: {
                  color: function(params) {
                    if (params.data.status === '异常') return '#F56C6C';
                    if (params.data.status === '待检修') return '#E6A23C';
                    if (params.data.status === '维护中') return '#909399';
                    return '#67C23A';
                  }
                },
                label: {
                  show: true,
                  formatter: '{b}',
                  position: 'right'
                }
              }
            ]
          });
          
          // 注册地图点击事件
          mapChart.on('click', (params) => {
            if (params.componentType === 'series') {
              const facility = this.facilities.find(item => item.name === params.name);
              if (facility) {
                this.viewFacilityDetail(facility);
              }
            }
          });
        }
      });
    },
    
    initRealTimeChart() {
      this.$nextTick(() => {
        if (this.$refs.realTimeChart) {
          const realTimeChart = echarts.init(this.$refs.realTimeChart);
          realTimeChart.setOption({
            title: {
              text: '实时运行数据'
            },
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: ['负载率', '温度', '能耗']
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: ['09:00', '09:10', '09:20', '09:30', '09:40', '09:50', '10:00', '10:10']
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                name: '负载率',
                type: 'line',
                data: [65, 68, 72, 75, 70, 68, 65, 67],
                itemStyle: {
                  color: '#409EFF'
                }
              },
              {
                name: '温度',
                type: 'line',
                data: [35, 36, 37, 38, 38, 37, 36, 35],
                itemStyle: {
                  color: '#F56C6C'
                }
              },
              {
                name: '能耗',
                type: 'line',
                data: [120, 122, 125, 130, 128, 125, 122, 120],
                itemStyle: {
                  color: '#67C23A'
                }
              }
            ]
          });
        }
      });
    },
    
    initMonitorChart() {
      this.$nextTick(() => {
        if (this.$refs.monitorChart) {
          const monitorChart = echarts.init(this.$refs.monitorChart);
          const now = new Date();
          const times = [];
          const data = [];
          
          // 生成过去2小时的时间点和模拟数据
          for (let i = 0; i < 24; i++) {
            const time = new Date(now - (23 - i) * 5 * 60 * 1000);
            times.unshift(time.getHours() + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()));
            
            // 生成模拟的负载数据，围绕当前负载值上下浮动
            const baseLoad = parseInt(this.currentFacility.load || 65);
            const randomVariation = Math.floor(Math.random() * 10) - 5; // -5到5之间的随机数
            data.unshift(Math.max(0, Math.min(100, baseLoad + randomVariation)));
          }
          
          monitorChart.setOption({
            title: {
              text: '实时负载监控'
            },
            tooltip: {
              trigger: 'axis',
              formatter: function(params) {
                return params[0].name + '<br>' + 
                       params[0].seriesName + ': ' + params[0].value + '%<br>' +
                       '更新时间: ' + new Date().toLocaleTimeString();
              }
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: times
            },
            yAxis: {
              type: 'value',
              min: 0,
              max: 100,
              axisLabel: {
                formatter: '{value}%'
              }
            },
            series: [
              {
                name: '负载率',
                type: 'line',
                smooth: true,
                data: data,
                markLine: {
                  data: [
                    {
                      name: '警戒线',
                      yAxis: 80,
                      lineStyle: {
                        color: '#F56C6C'
                      },
                      label: {
                        formatter: '警戒线(80%)',
                        position: 'insideEndTop'
                      }
                    }
                  ]
                },
                areaStyle: {
                  opacity: 0.3,
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: 'rgba(58,77,233,0.8)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(58,77,233,0.3)'
                    }
                  ])
                }
              }
            ]
          });
        }
      });
    },
    
    updateRealTimeData() {
      // 这里是模拟更新实时数据，实际应用中应该从后端API获取最新数据
      // 随机更新一些设施的状态和数据
      this.facilities.forEach(facility => {
        // 随机微调负载率
        const loadChange = Math.floor(Math.random() * 5) - 2; // -2到2之间的随机数
        facility.load = Math.max(0, Math.min(100, parseInt(facility.load) + loadChange)).toString();
        
        // 随机微调温度
        const tempChange = Math.floor(Math.random() * 3) - 1; // -1到1之间的随机数
        facility.temperature = Math.max(20, Math.min(50, parseInt(facility.temperature || '35') + tempChange)).toString();
        
        // 更新时间
        facility.lastUpdate = new Date().toLocaleString();
      });
      
      // 如果当前正在监控某个设施，也需要更新监控图表
      if (this.monitorVisible && this.currentFacility && this.$refs.monitorChart) {
        this.initMonitorChart();
      }
      
      // 告警检测
      this.checkForAlerts();
    },
    
    checkForAlerts() {
      // 模拟告警检测逻辑，实际应用中应根据预设的告警规则进行检测
      const now = new Date();
      
      this.facilities.forEach(facility => {
        // 检查负载率是否超过警戒线
        if (parseInt(facility.load) > 80 && facility.status !== '异常') {
          // 创建新告警
          const newAlert = {
            id: 'AL' + Math.floor(Math.random() * 10000),
            time: now.toLocaleString(),
            facility: facility.name,
            location: facility.location,
            level: parseInt(facility.load) > 90 ? '严重' : '警告',
            content: `负载率超过安全阈值，当前${facility.load}%`,
            status: '待处理'
          };
          
          // 更新设施状态
          facility.status = '异常';
          facility.lastUpdate = now.toLocaleString();
          
          // 添加到告警列表
          this.recentAlerts.unshift(newAlert);
          
          // 保持告警列表不超过10条
          if (this.recentAlerts.length > 10) {
            this.recentAlerts.pop();
          }
          
          // 发送告警通知
          this.$notify({
            title: '设施告警',
            message: `${facility.name}：${newAlert.content}`,
            type: 'warning',
            duration: 0
          });
        }
        
        // 检查温度是否超过警戒线
        if (parseInt(facility.temperature || '35') > 40 && facility.status !== '异常') {
          // 创建新告警
          const newAlert = {
            id: 'AL' + Math.floor(Math.random() * 10000),
            time: now.toLocaleString(),
            facility: facility.name,
            location: facility.location,
            level: parseInt(facility.temperature) > 45 ? '严重' : '警告',
            content: `设备温度过高，当前${facility.temperature}°C`,
            status: '待处理'
          };
          
          // 更新设施状态
          facility.status = '异常';
          facility.lastUpdate = now.toLocaleString();
          
          // 添加到告警列表
          this.recentAlerts.unshift(newAlert);
          
          // 保持告警列表不超过10条
          if (this.recentAlerts.length > 10) {
            this.recentAlerts.pop();
          }
          
          // 发送告警通知
          this.$notify({
            title: '设施告警',
            message: `${facility.name}：${newAlert.content}`,
            type: 'warning',
            duration: 0
          });
        }
      });
    },
    
    showAddFacility() {
      this.facilityForm = {
        name: '',
        type: '',
        location: '',
        department: '',
        description: ''
      };
      this.addVisible = true;
    },
    
    saveFacility() {
      if (!this.facilityForm.name || !this.facilityForm.type) {
        this.$message.warning('请填写完整的设施信息');
        return;
      }
      
      const newFacility = {
        code: 'CF' + (this.facilities.length + 10).toString().padStart(3, '0'),
        name: this.facilityForm.name,
        type: this.facilityForm.type,
        location: this.facilityForm.location,
        status: '正常',
        load: '50',
        lastUpdate: new Date().toLocaleString(),
        department: this.facilityForm.department,
        description: this.facilityForm.description,
        runtime: '0小时',
        power: '0',
        temperature: '25',
        humidity: '50'
      };
      
      this.facilities.unshift(newFacility);
      this.facilityStats.total = this.facilities.length;
      
      this.$message.success('设施添加成功');
      this.addVisible = false;
      
      // 更新图表
      this.initCharts();
      this.initMap();
    },
    
    viewAlerts() {
      if (this.recentAlerts.length > 0) {
        this.currentAlert = this.recentAlerts[0];
        this.alertVisible = true;
      } else {
        this.$message.info('当前没有告警信息');
      }
    },
    
    refreshData() {
      this.updateRealTimeData();
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
        '交通设施': 'primary',
        '水务设施': 'info',
        '电力设施': 'warning',
        '环保设施': 'success',
        '通信设施': 'danger',
        '照明设施': '',
        '公共安全': 'info'
      };
      return map[type] || 'info';
    },
    
    getStatusTagClass(status) {
      const map = {
        '正常': 'success',
        '异常': 'danger',
        '维护中': 'info',
        '待检修': 'warning'
      };
      return map[status] || 'info';
    },
    
    getAlertLevelType(level) {
      const types = {
        '严重': 'danger',
        '警告': 'warning',
        '一般': 'info'
      };
      return types[level] || 'info';
    },
    
    getLoadStatus(load) {
      const loadValue = parseInt(load);
      if (loadValue >= 80) return 'exception';
      if (loadValue >= 60) return 'warning';
      return 'success';
    },
    
    getTemperatureStatus(temp) {
      const tempValue = parseInt(temp);
      if (tempValue >= 40) return 'exception';
      if (tempValue >= 35) return 'warning';
      return 'success';
    },
    
    viewFacilityDetail(row) {
      this.currentFacility = row;
      this.detailVisible = true;
      
      this.$nextTick(() => {
        this.initRealTimeChart();
      });
    },
    
    monitorFacility(row) {
      this.currentFacility = row;
      this.monitorVisible = true;
      
      this.$nextTick(() => {
        this.initMonitorChart();
      });
    },
    
    viewTrend(row) {
      this.currentFacility = row;
      this.activeTab = 'analysis';
      
      this.$nextTick(() => {
        this.initCharts();
      });
      
      this.$message.info(`正在查看${row.name}的运行趋势`);
    },
    
    handleFacilityAlert(row) {
      const alert = this.recentAlerts.find(a => a.facility === row.name && a.status === '待处理');
      
      if (alert) {
        this.currentAlert = alert;
        this.alertVisible = true;
      } else {
        this.$message.info('没有找到相关告警信息');
      }
    },
    
    handleAlert(alert) {
      this.currentAlert = alert;
      this.alertForm = {
        method: '远程处理',
        handler: '',
        remark: ''
      };
      this.alertVisible = true;
    },
    
    saveAlertHandler() {
      if (!this.alertForm.handler) {
        this.$message.warning('请填写处理人信息');
        return;
      }
      
      // 更新告警状态
      const alertIndex = this.recentAlerts.findIndex(a => a.id === this.currentAlert.id);
      if (alertIndex !== -1) {
        this.recentAlerts[alertIndex].status = '处理中';
        
        // 添加到历史告警
        this.facilityAlerts.unshift({
          time: this.currentAlert.time,
          level: this.currentAlert.level,
          content: this.currentAlert.content,
          duration: '进行中',
          status: '处理中',
          handler: this.alertForm.handler
        });
      }
      
      // 如果是设施告警，更新设施状态
      const facilityIndex = this.facilities.findIndex(f => f.name === this.currentAlert.facility);
      if (facilityIndex !== -1) {
        this.facilities[facilityIndex].status = '维护中';
        this.facilities[facilityIndex].lastUpdate = new Date().toLocaleString();
      }
      
      // 更新统计数据
      this.facilityStats.alerts = this.recentAlerts.filter(a => a.status === '待处理').length;
      
      this.$message.success('告警处理任务已创建');
      this.alertVisible = false;
      
      // 模拟15分钟内响应
      this.$notify({
        title: '告警响应',
        message: `${this.currentAlert.facility}的告警已分配给${this.alertForm.handler}处理，预计响应时间15分钟内`,
        type: 'success',
        duration: 4500
      });
    },
    
    toggleVideo() {
      this.$message.info('正在连接视频监控...');
    },
    
    testAlarm() {
      this.$confirm('确定要测试告警功能吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('告警测试成功，系统响应正常');
      }).catch(() => {});
    },
    
    exportData() {
      this.$message.success('数据导出成功');
    },
    
    viewAllAlerts() {
      this.$router.push('/monitor');
    },
    
    // 在切换tab时重新初始化图表
    handleTabChange(tab) {
      if (tab === 'analysis') {
        this.$nextTick(() => {
          this.initCharts();
        });
      }
    }
  },
  watch: {
    activeTab(newVal) {
      if (newVal === 'analysis') {
        this.$nextTick(() => {
          this.initCharts();
        });
      }
    }
  }
}
</script>
<style scoped>
.city-operation {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 20px;
}

.page-header {
  padding: 15px 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  margin: 0;
  color: #303133;
}

.page-desc {
  color: #606266;
  margin-top: 5px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
  border-radius: 4px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card-primary {
  background: linear-gradient(135deg, #409EFF, #2b85e4);
  color: #fff;
}

.card-success {
  background: linear-gradient(135deg, #67C23A, #52c41a);
  color: #fff;
}

.card-warning {
  background: linear-gradient(135deg, #E6A23C, #fa8c16);
  color: #fff;
}

.card-info {
  background: linear-gradient(135deg, #909399, #73767a);
  color: #fff;
}

.stat-icon {
  font-size: 36px;
  margin-right: 15px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin: 5px 0;
}

.stat-trend {
  font-size: 12px;
}

.monitoring-panel {
  margin-bottom: 20px;
}

.map-card, .alert-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.map-card:hover, .alert-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.facility-map {
  height: 400px;
}

.real-time-alerts {
  max-height: 400px;
  overflow-y: auto;
}

.no-alerts {
  text-align: center;
  padding: 30px 0;
  color: #909399;
}

.no-alerts i {
  font-size: 48px;
  margin-bottom: 10px;
  color: #67C23A;
}

.alert-list {
  padding: 10px 0;
}

.alert-item {
  padding: 10px 15px;
  border-left: 4px solid transparent;
  margin-bottom: 10px;
  background-color: #f8f8f8;
  border-radius: 0 4px 4px 0;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.alert-item:hover {
  background-color: #f0f0f0;
  transform: translateX(5px);
}

.alert-item.critical {
  border-left-color: #F56C6C;
}

.alert-item.warning {
  border-left-color: #E6A23C;
}

.alert-item.info {
  border-left-color: #909399;
}

.alert-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.alert-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.alert-desc {
  font-size: 14px;
  color: #606266;
}

.alert-actions {
  align-self: flex-end;
  margin-top: 5px;
}

.content-section {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-bar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.parameter-card {
  height: 300px;
}

.parameter-list {
  padding: 10px;
}

.parameter-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
}

.parameter-label {
  color: #606266;
}

.parameter-value {
  font-weight: bold;
  color: #303133;
}

.monitor-header {
  margin-bottom: 15px;
}

.monitor-header h3 {
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.update-info {
  font-size: 12px;
  color: #909399;
}

.monitor-chart {
  height: 300px;
}

.parameter-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.parameter-group {
  margin-bottom: 15px;
}

.group-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.parameter-card {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 10px;
}

.parameter-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.parameter-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.action-panel {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 数据分析页面样式 */
.analysis-container {
  padding: 10px;
}

.chart-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 4px;
  overflow: hidden;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.chart-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  display: flex;
  align-items: center;
}

.chart-header i {
  margin-right: 5px;
}

.chart-container {
  height: 350px;
  width: 100%;
}
</style> 