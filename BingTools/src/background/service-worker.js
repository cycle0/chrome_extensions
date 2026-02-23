/**
 * @fileoverview Service Worker 主入口
 * @description Bing Tools 扩展的后台服务
 */

import { CONFIG } from './config.js';

// 安装/更新事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[BingTools] Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    initializeExtension();
  } else if (details.reason === 'update') {
    handleUpdate(details.previousVersion);
  }
});

// 启动事件
chrome.runtime.onStartup.addListener(() => {
  console.log('[BingTools] Browser started');
});

// 消息监听
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  return handleMessage(request, sender, sendResponse);
});

/**
 * 初始化扩展
 */
async function initializeExtension() {
  try {
    // 设置默认配置
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.SETTINGS]: CONFIG.DEFAULT_SETTINGS,
      installDate: Date.now(),
      version: chrome.runtime.getManifest().version
    });
    
    console.log('[BingTools] 初始化完成');
  } catch (error) {
    console.error('[BingTools] 初始化失败:', error);
  }
}

/**
 * 处理更新
 */
function handleUpdate(previousVersion) {
  const currentVersion = chrome.runtime.getManifest().version;
  console.log(`[BingTools] Updated from ${previousVersion} to ${currentVersion}`);
  // 数据迁移等操作
}

/**
 * 处理消息
 */
function handleMessage(request, sender, sendResponse) {
  const { action, data } = request;
  
  switch (action) {
    // 全屏相关
    case CONFIG.ACTIONS.TOGGLE_FULLSCREEN:
      handleToggleFullscreen(sender, sendResponse);
      return true;
    
    case CONFIG.ACTIONS.GET_FULLSCREEN_STATE:
      handleGetFullscreenState(sender, sendResponse);
      return false;
    
    // 下载相关
    case CONFIG.ACTIONS.DOWNLOAD_IMAGE:
      handleDownloadImage(data, sendResponse);
      return true;
    
    case CONFIG.ACTIONS.GET_DOWNLOAD_SETTINGS:
      handleGetDownloadSettings(sendResponse);
      return true;
    
    case CONFIG.ACTIONS.SET_DOWNLOAD_SETTINGS:
      handleSetDownloadSettings(data, sendResponse);
      return true;
    
    // 通用设置
    case CONFIG.ACTIONS.GET_SETTINGS:
      handleGetSettings(sendResponse);
      return true;
    
    case CONFIG.ACTIONS.SET_SETTINGS:
      handleSetSettings(data, sendResponse);
      return true;
    
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + action });
      return false;
  }
}

/**
 * 处理切换全屏
 */
async function handleToggleFullscreen(sender, sendResponse) {
  try {
    if (sender.tab?.id) {
      await chrome.tabs.sendMessage(sender.tab.id, {
        to: 'content',
        action: CONFIG.ACTIONS.TOGGLE_FULLSCREEN
      });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No active tab' });
    }
  } catch (error) {
    console.error('[BingTools] 切换全屏失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 获取全屏状态
 */
function handleGetFullscreenState(sender, sendResponse) {
  sendResponse({ 
    success: true, 
    data: { isFullscreen: false } 
  });
}

/**
 * 处理图片下载
 */
async function handleDownloadImage(data, sendResponse) {
  try {
    const { url, filename } = data;
    
    // 检查权限
    const hasPermission = await chrome.permissions.contains({
      permissions: ['downloads']
    });
    
    if (!hasPermission) {
      sendResponse({ 
        success: false, 
        error: 'Permission denied: downloads',
        needPermission: true 
      });
      return;
    }
    
    // 执行下载
    const downloadId = await chrome.downloads.download({
      url,
      filename: sanitizeFilename(filename),
      saveAs: false
    });
    
    sendResponse({ success: true, data: { downloadId } });
  } catch (error) {
    console.error('[BingTools] 下载失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 获取下载设置
 */
async function handleGetDownloadSettings(sendResponse) {
  try {
    const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.DOWNLOAD_SETTINGS);
    const settings = result[CONFIG.STORAGE_KEYS.DOWNLOAD_SETTINGS] || 
                     CONFIG.DEFAULT_SETTINGS.download;
    sendResponse({ success: true, data: settings });
  } catch (error) {
    console.error('[BingTools] 获取下载设置失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 设置下载设置
 */
async function handleSetDownloadSettings(data, sendResponse) {
  try {
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.DOWNLOAD_SETTINGS]: data
    });
    sendResponse({ success: true });
  } catch (error) {
    console.error('[BingTools] 保存下载设置失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 获取所有设置
 */
async function handleGetSettings(sendResponse) {
  try {
    const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.SETTINGS);
    const settings = result[CONFIG.STORAGE_KEYS.SETTINGS] || CONFIG.DEFAULT_SETTINGS;
    sendResponse({ success: true, data: settings });
  } catch (error) {
    console.error('[BingTools] 获取设置失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 设置所有设置
 */
async function handleSetSettings(data, sendResponse) {
  try {
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.SETTINGS]: data
    });
    sendResponse({ success: true });
  } catch (error) {
    console.error('[BingTools] 保存设置失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 清理文件名
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^(con|prn|aux|nul|com\d|lpt\d)$/i, '_$1')
    .substring(0, 255);
}

// 标签页激活事件
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url?.includes('bing.com')) {
      console.log('[BingTools] Bing tab activated:', tabId);
    }
  } catch (error) {
    // 忽略错误
  }
});

console.log('[BingTools] Service Worker initialized');
