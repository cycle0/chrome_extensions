/**
 * @fileoverview 全局常量定义
 * @description Bing Tools扩展的共享常量
 */

const BTConstants = {
  // 版本信息
  VERSION: '1.0.0',
  
  // 存储键名
  STORAGE_KEYS: {
    SETTINGS: 'bt_settings',
    FULLSCREEN_STATE: 'bt_fullscreen_state',
    DOWNLOAD_SETTINGS: 'bt_download_settings'
  },
  
  // 命名空间前缀
  NAMESPACE: {
    FULLSCREEN: 'bt-fs',
    DOWNLOAD: 'bt-dl'
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
      enabled: false,
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
  },
  
  // 图片分辨率选项
  RESOLUTIONS: [
    { value: 'UHD', label: 'UHD' },
    { value: '1920x1080', label: '1920x1080' },
    { value: '1366x768', label: '1366x768' },
    { value: '1280x720', label: '1280x720' },
    { value: '', label: 'Default' }
  ],
  
  // 分隔符选项
  SEPARATORS: [
    { value: '_', label: '_' },
    { value: '-', label: '-' },
    { value: ',', label: ',' },
    { value: ' ', label: 'Space' },
    { value: '.', label: '.' }
  ],
  
  // 选择器
  SELECTORS: {
    // Bing背景图片元素
    BACKGROUND_IMAGE: ['.img_cont', '#bgDiv', '#b_sydBgCont'],
    // 下载链接
    DOWNLOAD_LINK: 'a.downloadLink',
    // 图片描述
    IMAGE_DESCRIPTION: '.musCardCont a.title',
    // 版权信息
    COPYRIGHT: '.musCardCont div.copyright',
    // 导航按钮
    LEFT_NAV: '#leftNav',
    RIGHT_NAV: '#rightNav'
  },
  
  // Z-index层级
  Z_INDEX: {
    FULLSCREEN_BG: 9998,
    FULLSCREEN_BTN: 10000,
    DOWNLOAD_BTN: 9999,
    SETTINGS_MENU: 10001
  }
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BTConstants;
}
