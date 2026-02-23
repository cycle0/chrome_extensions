/**
 * @fileoverview Popup主脚本
 * @description Bing Tools扩展的弹窗界面逻辑
 */

class PopupManager {
  constructor() {
    this.elements = {};
    this.state = {
      settings: {},
      currentTab: null
    };
  }

  /**
   * 初始化
   */
  async init() {
    // 缓存DOM元素
    this.cacheElements();
    
    // 加载设置
    await this.loadSettings();
    
    // 绑定事件
    this.bindEvents();
    
    // 获取当前标签页
    await this.getCurrentTab();
    
    // 更新UI
    this.updateUI();
    
    console.log('[BingTools] Popup initialized');
  }

  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.elements = {
      fullscreenToggle: document.getElementById('fullscreen-toggle'),
      downloadToggle: document.getElementById('download-toggle'),
      refreshPageBtn: document.getElementById('refresh-page'),
      githubLink: document.getElementById('github-link')
    };
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 全屏开关
    this.elements.fullscreenToggle?.addEventListener('change', (e) => {
      this.handleToggle('fullscreen', e.target.checked);
    });

    // 下载开关
    this.elements.downloadToggle?.addEventListener('change', (e) => {
      this.handleToggle('download', e.target.checked);
    });

    // 刷新页面按钮
    this.elements.refreshPageBtn?.addEventListener('click', () => {
      this.refreshCurrentPage();
    });

    // GitHub链接
    this.elements.githubLink?.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/cycle0/chrome_extensions/tree/main/BingTools' });
    });
  }

  /**
   * 加载设置
   */
  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({
        from: 'popup',
        action: 'getSettings'
      });
      
      if (response.success) {
        this.state.settings = response.data;
      } else {
        // 使用默认设置
        this.state.settings = {
          fullscreen: { enabled: false },
          download: { enabled: true }
        };
      }
    } catch (error) {
      console.error('[BingTools] 加载设置失败:', error);
      this.state.settings = {
        fullscreen: { enabled: false },
        download: { enabled: true }
      };
    }
  }

  /**
   * 更新UI
   */
  updateUI() {
    const { fullscreen, download } = this.state.settings;
    
    if (this.elements.fullscreenToggle) {
      this.elements.fullscreenToggle.checked = fullscreen?.enabled || false;
    }
    
    if (this.elements.downloadToggle) {
      this.elements.downloadToggle.checked = download?.enabled !== false;
    }
  }

  /**
   * 处理功能开关
   */
  async handleToggle(feature, enabled) {
    try {
      // 更新本地设置
      this.state.settings[feature] = {
        ...this.state.settings[feature],
        enabled
      };
      
      // 保存设置
      await chrome.runtime.sendMessage({
        from: 'popup',
        action: 'setSettings',
        data: this.state.settings
      });
      
      // 通知内容脚本
      if (this.state.currentTab?.id) {
        await chrome.tabs.sendMessage(this.state.currentTab.id, {
          to: 'content',
          action: 'toggleFeature',
          data: { feature, enabled }
        }).catch(() => {
          // 内容脚本可能未加载，忽略错误
        });
      }
      
      // 如果是全屏功能，发送特定消息
      if (feature === 'fullscreen' && enabled) {
        this.sendFullscreenCommand();
      }
    } catch (error) {
      console.error('[BingTools] 切换功能失败:', error);
    }
  }

  /**
   * 发送全屏命令
   */
  async sendFullscreenCommand() {
    try {
      if (this.state.currentTab?.id) {
        await chrome.runtime.sendMessage({
          from: 'popup',
          action: 'toggleFullscreen'
        });
      }
    } catch (error) {
      console.error('[BingTools] 发送全屏命令失败:', error);
    }
  }

  /**
   * 获取当前标签页
   */
  async getCurrentTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      this.state.currentTab = tabs[0];
    } catch (error) {
      console.error('[BingTools] 获取当前标签页失败:', error);
    }
  }

  /**
   * 刷新当前页面
   */
  async refreshCurrentPage() {
    try {
      if (this.state.currentTab?.id) {
        await chrome.tabs.reload(this.state.currentTab.id);
      }
      window.close();
    } catch (error) {
      console.error('[BingTools] 刷新页面失败:', error);
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  const popup = new PopupManager();
  popup.init();
});
