import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 异常监控数据
    monitorData: {
      alerts: [],
      domains: ['交通', '环保', '能源', '水务', '安防'],
      statistics: {
        totalAlerts: 0,
        resolvedAlerts: 0,
        pendingAlerts: 0
      }
    },
    // 应急管理数据
    emergencyData: {
      events: [],
      status: 'normal', // normal, warning, emergency
      responseTime: 0
    },
    // 数据质量数据
    qualityData: {
      metrics: {
        accuracy: 0,
        completeness: 0,
        consistency: 0
      },
      issues: []
    },
    // 数据标准数据
    standardData: {
      standards: [],
      compliance: 0
    },
    // 元数据
    metadata: {
      definitions: [],
      sources: [],
      relationships: []
    },
    // 数据融合状态
    fusionData: {
      sources: [],
      status: 'idle', // idle, processing, completed
      successRate: 0
    },
    // 城市管理数据
    cityData: {
      facilities: [],
      status: {},
      alerts: []
    }
  },
  mutations: {
    // 更新异常监控数据
    updateMonitorData(state, data) {
      state.monitorData = { ...state.monitorData, ...data }
    },
    // 更新应急管理数据
    updateEmergencyData(state, data) {
      state.emergencyData = { ...state.emergencyData, ...data }
    },
    // 更新数据质量数据
    updateQualityData(state, data) {
      state.qualityData = { ...state.qualityData, ...data }
    },
    // 更新数据标准数据
    updateStandardData(state, data) {
      state.standardData = { ...state.standardData, ...data }
    },
    // 更新元数据
    updateMetadata(state, data) {
      state.metadata = { ...state.metadata, ...data }
    },
    // 更新数据融合状态
    updateFusionData(state, data) {
      state.fusionData = { ...state.fusionData, ...data }
    },
    // 更新城市管理数据
    updateCityData(state, data) {
      state.cityData = { ...state.cityData, ...data }
    }
  },
  actions: {
    // 模拟数据更新
    async fetchData({ commit }, { type, data }) {
      // 这里可以添加实际的数据获取逻辑
      commit(`update${type}Data`, data)
    }
  },
  getters: {
    // 获取异常监控统计
    monitorStats: state => state.monitorData.statistics,
    // 获取应急状态
    emergencyStatus: state => state.emergencyData.status,
    // 获取数据质量指标
    qualityMetrics: state => state.qualityData.metrics,
    // 获取数据标准符合率
    standardCompliance: state => state.standardData.compliance,
    // 获取元数据统计
    metadataStats: state => ({
      definitions: state.metadata.definitions.length,
      sources: state.metadata.sources.length,
      relationships: state.metadata.relationships.length
    }),
    // 获取数据融合状态
    fusionStatus: state => state.fusionData.status,
    // 获取城市设施状态
    cityFacilities: state => state.cityData.facilities
  }
}) 