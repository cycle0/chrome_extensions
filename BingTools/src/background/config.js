/**
 * @fileoverview Service Worker 配置
 * @description 背景脚本配置常量
 */

export const CONFIG = {
  // 版本信息
  VERSION: '1.0.0',
  
  // 存储键名
  STORAGE_KEYS: {
    SETTINGS: 'bt_settings',
    FULLSCREEN_STATE: 'bt_fullscreen_state',
    DOWNLOAD_SETTINGS: 'bt_download_settings'
  },
  
  // 消息动作类型
  ACTIONS: {
    // 全屏相关
    TOGGLE_FULLSCREEN: 'toggleFullscreen',
    GET_FULLSCREEN_STATE: 'getFullscreenState',
    
    // 下载相关
    DOWNLOAD_IMAGE: 'downloadImage',
    GET_DOWNLOAD_SETTINGS: 'getDownloadSettings',
    SET_DOWNLOAD_SETTINGS: 'setDownloadSettings',
    
    // 通用
    GET_SETTINGS: 'getSettings',
    SET_SETTINGS: 'setSettings',
    REFRESH_PAGE: 'refreshPage'
  },
  
  // 默认设置
  DEFAULT_SETTINGS: {
    fullscreen: {
      enabled: true,
      autoFullscreen: false
    },
    download: {
      enabled: true,
      resolution: 'UHD',
      namingRules: {
        baseName: true,
        imgNO: false,
        imgResolution: false,
        dateInfo: true,
        description: true,
        copyright: false
      },
      separator: '_'
    }
  }
};
