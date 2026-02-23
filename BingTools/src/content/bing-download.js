/**
 * @fileoverview Bing图片下载功能内容脚本
 * @description 在Bing首页添加图片下载按钮，支持自定义命名规则和分辨率
 */

(function() {
  'use strict';

  // 内联常量定义
  const NAMESPACE = 'bt-dl';
  
  const SELECTORS = {
    DOWNLOAD_LINK: 'a.downloadLink',
    IMAGE_DESCRIPTION: '.musCardCont a.title',
    COPYRIGHT: '.musCardCont div.copyright',
    LEFT_NAV: '#leftNav',
    RIGHT_NAV: '#rightNav'
  };
  
  const Z_INDEX = {
    DOWNLOAD_BTN: 9999,
    SETTINGS_MENU: 10001
  };
  
  const DEFAULT_SETTINGS = {
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
  };
  
  const STORAGE_KEY = 'bt_download_settings';

  // 状态
  let dateOffset = 0;
  let navEventBound = false;
  
  // 工具函数
  function namespacedId(id) {
    return `${NAMESPACE}-${id}`;
  }
  
  function sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^(con|prn|aux|nul|com\d|lpt\d)$/i, '_$1')
      .substring(0, 255);
  }
  
  function formatDate(date, separator = '-') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${separator}${month}${separator}${day}`;
  }
  
  function extractDateFromUrl(url) {
    try {
      const match = url.match(/Date:%\d+_/);
      if (match) {
        return match[0].slice(-9, -1);
      }
    } catch (e) {}
    return null;
  }
  
  // 获取下载按钮文本（根据浏览器语言）
  function getDownloadButtonText() {
    const lang = navigator.language.toLowerCase();
    const texts = {
      'zh': '下载今日必应图片',
      'zh-cn': '下载今日必应图片',
      'zh-tw': '下載今日必應圖片',
      'en': "Download Today's Bing Image",
      'ko': '오늘의 Bing 이미지 다운로드',
      'ja': '今日のBing画像をダウンロード',
      'fr': "Télécharger l'image Bing du jour"
    };
    return texts[lang] || texts['en'];
  }
  
  // 配置
  const config = {
    storageKey: STORAGE_KEY,
    btnId: namespacedId('btn'),
    menuId: namespacedId('menu'),
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
    enabled: true  // 默认启用
  };

  /**
   * 初始化
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  /**
   * 页面就绪处理
   */
  async function onReady() {
    // 加载保存的设置
    await loadSettings();
    
    // 绑定导航事件
    bindNavEvents();
    
    // 创建下载按钮
    createDownloadButton();
    
    // 创建设置菜单
    createSettingsMenu();
    
    // 根据设置显示/隐藏按钮
    toggleButtonVisibility(config.enabled);
    
    // 更新图片信息
    updateImageInfo();
    
    console.log('[BingTools] 下载功能初始化完成，状态:', config.enabled ? '启用' : '禁用');
  }

  /**
   * 加载设置
   */
  async function loadSettings() {
    try {
      // 加载下载功能设置
      const result = await chrome.storage.local.get(config.storageKey);
      const saved = result[config.storageKey];
      if (saved) {
        config.settings = { ...config.settings, ...saved };
      }
      
      // 加载功能开关设置
      const result2 = await chrome.storage.local.get('bt_settings');
      const settings = result2.bt_settings;
      if (settings && settings.download) {
        config.enabled = settings.download.enabled !== false;
      }
    } catch (error) {
      console.error('[BingTools] 加载设置失败:', error);
    }
  }
  
  /**
   * 显示/隐藏按钮
   */
  function toggleButtonVisibility(show) {
    const button = document.getElementById(config.btnId);
    if (button) {
      button.style.display = show ? 'block' : 'none';
    }
    const menu = document.getElementById(config.menuId);
    if (menu && !show) {
      menu.style.display = 'none';
    }
  }

  /**
   * 保存设置
   */
  async function saveSettings() {
    try {
      await chrome.storage.local.set({ [config.storageKey]: config.settings });
    } catch (error) {
      console.error('[BingTools] 保存设置失败:', error);
    }
  }

  /**
   * 绑定导航事件（上一张/下一张）
   */
  function bindNavEvents() {
    if (navEventBound) return;
    navEventBound = true;

    const leftNav = document.getElementById('leftNav');
    const rightNav = document.getElementById('rightNav');

    if (leftNav) {
      leftNav.addEventListener('click', (e) => {
        e.preventDefault();
        dateOffset = dateOffset === -7 ? -7 : dateOffset - 1;
      });
    }

    if (rightNav) {
      rightNav.addEventListener('click', (e) => {
        e.preventDefault();
        dateOffset = dateOffset === 0 ? 0 : dateOffset + 1;
      });
    }
  }

  /**
   * 创建下载按钮
   */
  function createDownloadButton() {
    if (document.getElementById(config.btnId)) return;

    const btn = document.createElement('a');
    btn.id = config.btnId;
    btn.className = `${NAMESPACE}-main-btn`;
    btn.textContent = getDownloadButtonText();
    btn.style.cssText = `
      position: fixed !important;
      right: 20% !important;
      top: 12.5% !important;
      z-index: ${Z_INDEX.DOWNLOAD_BTN} !important;
      padding: 0.5em 1em !important;
      background: rgba(195, 209, 207, 0.58) !important;
      color: #333 !important;
      font-size: 1.2em !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      border-radius: 0.25em !important;
      box-shadow: 0 0 3px rgba(125, 125, 125, 0.25) !important;
      cursor: pointer !important;
      text-decoration: none !important;
      transition: background 0.3s ease !important;
    `;

    // 鼠标悬停效果
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(195, 209, 207, 0.8)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(195, 209, 207, 0.58)';
    });

    // 鼠标悬停时更新图片信息
    btn.addEventListener('mouseenter', () => {
      updateImageInfo();
      updateButtonLink(btn);
    });

    // 右键打开设置菜单
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openSettingsMenu();
    });

    document.body.appendChild(btn);
    updateButtonLink(btn);
  }

  /**
   * 更新按钮链接
   */
  function updateButtonLink(btn) {
    const url = config.settings.url;
    const name = config.settings.name;
    
    if (url) {
      btn.href = url;
      btn.download = name || 'bing-image.jpg';
      btn.title = `img name: ${name || 'bing-image.jpg'}\n右键打开设置菜单 | Right Click to open settings`;
    }
  }

  /**
   * 更新图片信息
   */
  function updateImageInfo() {
    const link = document.querySelector(SELECTORS.DOWNLOAD_LINK);
    if (!link) return;

    let url = link.href.split('&rf')[0];
    
    // 根据分辨率设置修改URL
    if (config.settings.resolution) {
      url = url.replace(/\d{4}x\d{3,4}/, config.settings.resolution);
    }

    // 提取文件名信息
    const match = /id=.+?\.(jpg|png)/.exec(url);
    if (!match) {
      console.warn('[BingTools] 图片URL格式异常');
      return;
    }

    const nameInfo = match[0].replace('id=', '').replace(/^OHR\./, '').split('_');
    const imgFormat = nameInfo[nameInfo.length - 1].split('.')[1];

    // 根据命名规则构建文件名
    const parts = [];
    const rules = config.settings.namingRules;
    const separator = config.settings.separator || '_';

    if (rules.baseName && nameInfo[0]) {
      parts.push(nameInfo[0]);
    }

    if (rules.imgNO && nameInfo[1]) {
      parts.push(nameInfo[1]);
    }

    if (rules.imgResolution && nameInfo[2]) {
      parts.push(nameInfo[2].split('.')[0]);
    }

    if (rules.description) {
      try {
        const desc = document.querySelector(SELECTORS.IMAGE_DESCRIPTION)?.textContent;
        if (desc) parts.push(desc.trim());
      } catch (e) {}
    }

    if (rules.copyright) {
      try {
        const copyright = document.querySelector(SELECTORS.COPYRIGHT)?.textContent;
        if (copyright) parts.push(copyright.trim());
      } catch (e) {}
    }

    if (rules.dateInfo) {
      let dateInfo = '';
      try {
        const descLink = document.querySelector(SELECTORS.IMAGE_DESCRIPTION);
        if (descLink && descLink.href) {
          dateInfo = extractDateFromUrl(descLink.href);
        }
      } catch (e) {}
      
      if (!dateInfo) {
        const now = new Date();
        const imgDate = new Date(now.getTime() + dateOffset * 24 * 60 * 60 * 1000);
        dateInfo = formatDate(imgDate, '-');
      }
      
      if (dateInfo) parts.push(dateInfo);
    }

    // 清理并组合文件名
    let name = parts.filter(Boolean).join(separator);
    
    // 清理多余连接符
    const sepReg = new RegExp(`[${separator === ' ' ? '\\s' : separator}]{2,}`, 'g');
    name = name.replace(sepReg, separator);
    name = name.replace(new RegExp(`^[${separator === ' ' ? '\\s' : separator}]+|[${separator === ' ' ? '\\s' : separator}]+$`, 'g'), '');

    // 确保有文件名
    if (!name || name === `.${imgFormat}`) {
      name = nameInfo[0];
    }

    name = sanitizeFilename(`${name}.${imgFormat}`);

    config.settings.url = url;
    config.settings.name = name;

    // 更新按钮
    const btn = document.getElementById(config.btnId);
    if (btn) {
      updateButtonLink(btn);
    }
  }

  /**
   * 创建设置菜单
   */
  function createSettingsMenu() {
    if (document.getElementById(config.menuId)) return;

    const menu = document.createElement('div');
    menu.id = config.menuId;
    menu.className = `${NAMESPACE}-menu`;
    menu.style.cssText = `
      position: fixed !important;
      z-index: ${Z_INDEX.SETTINGS_MENU} !important;
      right: 1% !important;
      top: 5% !important;
      font-size: 14px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      display: none !important;
    `;

    menu.innerHTML = buildMenuHTML();
    document.body.appendChild(menu);

    // 绑定菜单事件
    bindMenuEvents(menu);
  }

  /**
   * 构建菜单HTML
   */
  function buildMenuHTML() {
    const rules = config.settings.namingRules;
    const resolution = config.settings.resolution;
    const separator = config.settings.separator;

    return `
      <fieldset class="bt-dl-fieldset">
        <legend>设置 | Settings</legend>
        <div class="bt-dl-content">
          <ul class="bt-dl-section">
            <li class="bt-dl-section-title">图片分辨率 | Image Resolution</li>
            <li class="bt-dl-option">
              <label>UHD</label>
              <input type="radio" name="bt-dl-resolution" value="UHD" ${resolution === 'UHD' ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>1920x1080</label>
              <input type="radio" name="bt-dl-resolution" value="1920x1080" ${resolution === '1920x1080' ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>1366x768</label>
              <input type="radio" name="bt-dl-resolution" value="1366x768" ${resolution === '1366x768' ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>1280x720</label>
              <input type="radio" name="bt-dl-resolution" value="1280x720" ${resolution === '1280x720' ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>Default</label>
              <input type="radio" name="bt-dl-resolution" value="" ${resolution === '' ? 'checked' : ''}>
            </li>
          </ul>
          
          <ul class="bt-dl-section">
            <li class="bt-dl-section-title">命名规则 | Naming Rules</li>
            <li class="bt-dl-option">
              <label>基础名称 | Base Name</label>
              <input type="checkbox" name="bt-dl-namerule" value="baseName" ${rules.baseName ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>图片编号 | Image Number</label>
              <input type="checkbox" name="bt-dl-namerule" value="imgNO" ${rules.imgNO ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>分辨率 | Resolution</label>
              <input type="checkbox" name="bt-dl-namerule" value="imgResolution" ${rules.imgResolution ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>图片描述 | Description</label>
              <input type="checkbox" name="bt-dl-namerule" value="description" ${rules.description ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>版权信息 | Copyright</label>
              <input type="checkbox" name="bt-dl-namerule" value="copyright" ${rules.copyright ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>日期信息 | Date Info</label>
              <input type="checkbox" name="bt-dl-namerule" value="dateInfo" ${rules.dateInfo ? 'checked' : ''}>
            </li>
            <li class="bt-dl-option">
              <label>连接符 | Separator</label>
              <select name="bt-dl-separator">
                <option value="_" ${separator === '_' ? 'selected' : ''}>_</option>
                <option value="-" ${separator === '-' ? 'selected' : ''}>-</option>
                <option value="," ${separator === ',' ? 'selected' : ''}>,</option>
                <option value=" " ${separator === ' ' ? 'selected' : ''}>Space</option>
                <option value="." ${separator === '.' ? 'selected' : ''}>.</option>
              </select>
            </li>
          </ul>
        </div>
        <footer class="bt-dl-footer">
          <button class="bt-dl-btn bt-dl-btn-reset">重置 | Reset</button>
          <button class="bt-dl-btn bt-dl-btn-save">保存 | Save</button>
          <button class="bt-dl-btn bt-dl-btn-cancel">取消 | Cancel</button>
        </footer>
      </fieldset>
    `;
  }

  /**
   * 绑定菜单事件
   */
  function bindMenuEvents(menu) {
    menu.addEventListener('click', async (e) => {
      // 取消按钮
      if (e.target.classList.contains('bt-dl-btn-cancel')) {
        menu.style.display = 'none';
        return;
      }

      // 保存按钮
      if (e.target.classList.contains('bt-dl-btn-save')) {
        await saveMenuSettings(menu);
        menu.style.display = 'none';
        return;
      }

      // 重置按钮
      if (e.target.classList.contains('bt-dl-btn-reset')) {
        await resetSettings();
        menu.innerHTML = buildMenuHTML();
        bindMenuEvents(menu);
        return;
      }
    });
  }

  /**
   * 保存菜单设置
   */
  async function saveMenuSettings(menu) {
    // 获取分辨率
    const resolutionRadio = menu.querySelector('input[name="bt-dl-resolution"]:checked');
    if (resolutionRadio) {
      config.settings.resolution = resolutionRadio.value;
    }

    // 获取命名规则
    const nameRules = {};
    menu.querySelectorAll('input[name="bt-dl-namerule"]').forEach(checkbox => {
      nameRules[checkbox.value] = checkbox.checked;
    });
    config.settings.namingRules = nameRules;

    // 获取分隔符
    const separatorSelect = menu.querySelector('select[name="bt-dl-separator"]');
    if (separatorSelect) {
      config.settings.separator = separatorSelect.value;
    }

    // 保存并更新
    await saveSettings();
    updateImageInfo();
    
    // 显示保存成功提示
    showSaveNotification();
  }

  /**
   * 重置设置
   */
  async function resetSettings() {
    config.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    await saveSettings();
    updateImageInfo();
  }

  /**
   * 打开设置菜单
   */
  function openSettingsMenu() {
    const menu = document.getElementById(config.menuId);
    if (menu) {
      menu.style.display = 'block';
    }
  }
  
  /**
   * 显示保存成功提示
   */
  function showSaveNotification() {
    // 创建提示元素
    const notification = document.createElement('div');
    notification.className = `${NAMESPACE}-notification`;
    notification.textContent = '设置已保存 | Settings Saved';
    notification.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: #4CAF50 !important;
      color: white !important;
      padding: 10px 20px !important;
      border-radius: 4px !important;
      font-size: 14px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      z-index: ${Z_INDEX.SETTINGS_MENU + 1} !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
      animation: bt-dl-fadein 0.3s ease !important;
    `;
    
    // 添加动画样式
    if (!document.getElementById(`${NAMESPACE}-notification-style`)) {
      const style = document.createElement('style');
      style.id = `${NAMESPACE}-notification-style`;
      style.textContent = `
        @keyframes bt-dl-fadein {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes bt-dl-fadeout {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // 2秒后自动移除
    setTimeout(() => {
      notification.style.animation = 'bt-dl-fadeout 0.3s ease forwards !important';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }

  // 监听来自background的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.to !== 'content') return false;
    
    switch (request.action) {
      case 'getDownloadSettings':
        sendResponse({ success: true, data: config.settings });
        return false;
      
      case 'setDownloadSettings':
        config.settings = { ...config.settings, ...request.data };
        saveSettings();
        updateImageInfo();
        sendResponse({ success: true });
        return false;
      
      case 'toggleFeature':
        // 处理功能开关
        if (request.data?.feature === 'download') {
          config.enabled = request.data.enabled;
          toggleButtonVisibility(config.enabled);
          sendResponse({ success: true });
        }
        return false;
    }
    
    return false;
  });

  // 启动
  init();
})();
