/**
 * @fileoverview Bing全屏功能内容脚本
 * @description 使Bing页面背景图片全屏显示，支持浏览器全屏切换
 */

(function() {
  'use strict';

  // 内联常量定义（避免依赖共享模块）
  const NAMESPACE = 'bt-fs';
  
  const SELECTORS = {
    BACKGROUND_IMAGE: ['.img_cont', '#bgDiv', '#b_sydBgCont']
  };
  
  const Z_INDEX = {
    FULLSCREEN_BG: 9998,
    FULLSCREEN_BTN: 10000
  };
  
  const STORAGE_KEY = 'bt_fullscreen_state';
  
  // 工具函数
  function namespacedId(id) {
    return `${NAMESPACE}-${id}`;
  }
  
  function findElement(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }
  
  // 获取按钮文本（根据浏览器语言）
  function getFullscreenButtonText(type) {
    const lang = navigator.language.toLowerCase();
    const texts = {
      toggle: {
        'zh': '开启背景全屏',
        'zh-cn': '开启背景全屏',
        'zh-tw': '開啟背景全螢幕',
        'en': 'Enable Fullscreen',
        'ko': '전체 화면 켜기',
        'ja': '全画面表示を有効にする',
        'fr': 'Activer le plein écran'
      },
      exit: {
        'zh': '退出背景全屏',
        'zh-cn': '退出背景全屏',
        'zh-tw': '退出背景全螢幕',
        'en': 'Exit Fullscreen',
        'ko': '전체 화면 끄기',
        'ja': '全画面表示を終了',
        'fr': 'Quitter le plein écran'
      },
      exitAll: {
        'zh': '退出全部全屏',
        'zh-cn': '退出全部全屏',
        'zh-tw': '退出全部全螢幕',
        'en': 'Exit All Fullscreen',
        'ko': '모든 전체 화면 종료',
        'ja': 'すべての全画面表示を終了',
        'fr': 'Quitter tous les pleins écrans'
      }
    };
    return texts[type][lang] || texts[type]['en'];
  }
  
  // 状态管理
  const state = {
    isFullscreenMode: false,
    isBrowserFullscreen: false,
    originalState: {
      elements: new Map(),
      styles: new Map()
    }
  };

  // 配置
  const config = {
    storageKey: STORAGE_KEY,
    toggleButtonId: namespacedId('toggle'),
    fullscreenBgId: namespacedId('bg'),
    fullscreenStyleId: namespacedId('style'),
    enabled: true  // 默认启用
  };

  /**
   * 初始化
   */
  async function init() {
    // 先加载设置
    await loadSettings();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }
  
  /**
   * 加载设置
   */
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get('bt_settings');
      const settings = result.bt_settings;
      console.log('[BingTools] 加载设置:', settings);
      if (settings && settings.fullscreen) {
        config.enabled = settings.fullscreen.enabled !== false;
        console.log('[BingTools] 全屏功能状态:', config.enabled);
      } else {
        // 如果没有设置，默认为true（开启状态）
        config.enabled = true;
        console.log('[BingTools] 无设置，默认开启全屏功能');
      }
    } catch (error) {
      console.log('[BingTools] 加载全屏设置失败:', error);
      config.enabled = true;
    }
  }
  
  /**
   * 显示/隐藏按钮
   */
  function toggleButtonVisibility(show) {
    const button = document.getElementById(config.toggleButtonId);
    if (button) {
      button.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * 页面就绪处理
   */
  async function onReady() {
    // 创建切换按钮
    createToggleButton();
    
    // 根据设置显示/隐藏按钮
    toggleButtonVisibility(config.enabled);
    
    // 绑定事件
    bindEvents();
    
    // 恢复上次状态
    await restoreState();
    
    console.log('[BingTools] 全屏功能初始化完成，状态:', config.enabled ? '启用' : '禁用');
  }

  /**
   * 创建切换按钮
   */
  function createToggleButton() {
    // 检查是否已存在
    if (document.getElementById(config.toggleButtonId)) {
      return;
    }

    const button = document.createElement('button');
    button.id = config.toggleButtonId;
    button.textContent = getFullscreenButtonText('toggle');
    button.className = `${NAMESPACE}-toggle`;
    button.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      left: 20px !important;
      z-index: ${Z_INDEX.FULLSCREEN_BTN} !important;
      padding: 8px 16px !important;
      background: rgba(0, 0, 0, 0.6) !important;
      color: white !important;
      border: none !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      font-size: 14px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      opacity: 0.7 !important;
      transition: opacity 0.3s ease !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    `;

    // 鼠标悬停效果
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
    });

    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.7';
    });

    // 点击事件
    button.addEventListener('click', toggleFullscreenMode);

    document.body.appendChild(button);
  }

  /**
   * 绑定事件
   */
  function bindEvents() {
    // 监听浏览器全屏状态变化
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // ESC键退出
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isFullscreenMode) {
        toggleFullscreenMode();
      }
    });

    // 监听来自background的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.to !== 'content') return false;
      
      switch (request.action) {
        case 'toggleFullscreen':
          toggleFullscreenMode();
          sendResponse({ success: true });
          return false;
        
        case 'getFullscreenState':
          sendResponse({ 
            success: true, 
            data: { 
              isFullscreen: state.isFullscreenMode,
              isBrowserFullscreen: state.isBrowserFullscreen 
            } 
          });
          return false;
        
        case 'toggleFeature':
          // 处理功能开关
          if (request.data?.feature === 'fullscreen') {
            config.enabled = request.data.enabled;
            toggleButtonVisibility(config.enabled);
            sendResponse({ success: true });
          }
          return false;
      }
      
      return false;
    });
  }

  /**
   * 处理浏览器全屏状态变化
   */
  function handleFullscreenChange() {
    state.isBrowserFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    updateButtonText();
  }

  /**
   * 更新按钮文本
   */
  function updateButtonText() {
    const button = document.getElementById(config.toggleButtonId);
    if (!button) return;

    if (state.isFullscreenMode) {
      button.textContent = state.isBrowserFullscreen 
        ? getFullscreenButtonText('exitAll')
        : getFullscreenButtonText('exit');
    } else {
      button.textContent = getFullscreenButtonText('toggle');
    }
  }

  /**
   * 切换全屏模式
   */
  function toggleFullscreenMode() {
    if (state.isFullscreenMode) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  /**
   * 进入全屏模式
   */
  function enterFullscreen() {
    // 保存原始状态
    saveOriginalState();

    // 查找背景图片元素
    const bgElement = findElement(SELECTORS.BACKGROUND_IMAGE);
    
    if (!bgElement) {
      console.warn('[BingTools] 无法找到Bing背景图片元素');
      // 重试机制
      retryFindBackground();
      return;
    }

    applyFullscreenStyles(bgElement);
    
    // 请求浏览器全屏
    requestBrowserFullscreen(document.documentElement);
    
    state.isFullscreenMode = true;
    updateButtonText();
    saveState();
  }

  /**
   * 退出全屏模式
   */
  function exitFullscreen() {
    restoreOriginalState();
    
    // 如果浏览器处于全屏状态，也退出
    if (state.isBrowserFullscreen) {
      exitBrowserFullscreen();
    }

    state.isFullscreenMode = false;
    updateButtonText();
    saveState();
  }

  /**
   * 重试查找背景元素
   */
  function retryFindBackground() {
    let attempts = 0;
    const maxAttempts = 10;
    
    const interval = setInterval(() => {
      const bgElement = findElement(SELECTORS.BACKGROUND_IMAGE);
      attempts++;
      
      if (bgElement) {
        clearInterval(interval);
        applyFullscreenStyles(bgElement);
        requestBrowserFullscreen(document.documentElement);
        state.isFullscreenMode = true;
        updateButtonText();
        saveState();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error('[BingTools] 无法找到背景元素，全屏功能不可用');
      }
    }, 1000);
  }

  /**
   * 请求浏览器全屏
   */
  function requestBrowserFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => console.warn('[BingTools] 全屏请求失败:', err));
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  /**
   * 退出浏览器全屏
   */
  function exitBrowserFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  /**
   * 保存原始状态
   */
  function saveOriginalState() {
    // 保存body和html样式
    const bodyStyle = window.getComputedStyle(document.body);
    state.originalState.styles.set('body', {
      overflow: bodyStyle.overflow,
      overflowX: bodyStyle.overflowX,
      overflowY: bodyStyle.overflowY,
      margin: bodyStyle.margin,
      padding: bodyStyle.padding
    });

    const htmlStyle = window.getComputedStyle(document.documentElement);
    state.originalState.styles.set('html', {
      overflow: htmlStyle.overflow,
      overflowX: htmlStyle.overflowX,
      overflowY: htmlStyle.overflowY,
      margin: htmlStyle.margin,
      padding: htmlStyle.padding
    });
  }

  /**
   * 恢复原始状态
   */
  function restoreOriginalState() {
    // 移除全屏背景
    const fullscreenBg = document.getElementById(config.fullscreenBgId);
    if (fullscreenBg) {
      fullscreenBg.remove();
    }

    // 移除全屏样式
    const fullscreenStyle = document.getElementById(config.fullscreenStyleId);
    if (fullscreenStyle) {
      fullscreenStyle.remove();
    }

    // 恢复body和html样式
    document.body.style.overflow = '';
    document.body.style.overflowX = '';
    document.body.style.overflowY = '';
    document.body.style.margin = '';
    document.body.style.padding = '';

    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowX = '';
    document.documentElement.style.overflowY = '';
    document.documentElement.style.margin = '';
    document.documentElement.style.padding = '';

    // 重置状态
    state.originalState = {
      elements: new Map(),
      styles: new Map()
    };
  }

  /**
   * 应用全屏样式
   */
  function applyFullscreenStyles(element) {
    // 创建样式
    const style = document.createElement('style');
    style.id = config.fullscreenStyleId;
    style.textContent = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        overscroll-behavior: none !important;
        height: 100% !important;
        width: 100% !important;
      }
      
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      * {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      
      body > *:not(#${config.toggleButtonId}):not(#${config.fullscreenBgId}) {
        display: none !important;
      }
      
      #${config.fullscreenBgId} {
        display: block !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: ${Z_INDEX.FULLSCREEN_BG} !important;
        background-size: cover !important;
        background-position: center center !important;
        background-repeat: no-repeat !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);

    // 提取背景图片URL
    let backgroundImageUrl = '';
    
    if (element.style.backgroundImage) {
      backgroundImageUrl = element.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
    } else {
      const imgElement = element.querySelector('img');
      if (imgElement && imgElement.src) {
        backgroundImageUrl = imgElement.src;
      }
    }

    if (!backgroundImageUrl) {
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
        backgroundImageUrl = computedStyle.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
      }
    }

    // 创建全屏背景元素
    const fullscreenBg = document.createElement('div');
    fullscreenBg.id = config.fullscreenBgId;
    
    if (backgroundImageUrl) {
      // 简单的HTML转义
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
      fullscreenBg.style.backgroundImage = `url('${escapeHtml(backgroundImageUrl)}')`;
    } else {
      fullscreenBg.appendChild(element.cloneNode(true));
    }

    document.body.appendChild(fullscreenBg);
  }

  /**
   * 保存状态
   */
  async function saveState() {
    try {
      await chrome.storage.local.set({
        [config.storageKey]: {
          enabled: state.isFullscreenMode,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('[BingTools] 保存状态失败:', error);
    }
  }

  /**
   * 恢复状态
   */
  async function restoreState() {
    try {
      const result = await chrome.storage.local.get(config.storageKey);
            const saved = result[config.storageKey];
      if (saved && saved.enabled) {
        // 自动进入全屏（可选）
        // enterFullscreen();
      }
    } catch (error) {
      console.error('[BingTools] 恢复状态失败:', error);
    }
  }

  // 启动
  init();
})();
