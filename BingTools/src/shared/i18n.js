/**
 * @fileoverview 国际化工具
 * @description 提供多语言支持功能
 */

const BTI18n = {
  // 当前语言
  currentLang: navigator.language.toLowerCase(),
  
  // 获取消息
  getMessage(key, substitutions = []) {
    if (typeof chrome !== 'undefined' && chrome.i18n) {
      return chrome.i18n.getMessage(key, substitutions);
    }
    
    // 降级处理：返回key本身
    return key;
  },
  
  // 根据浏览器语言获取文本（用于内容脚本）
  getText(key) {
    const texts = {
      'toggleFullscreen': {
        'zh': '开启背景全屏',
        'zh-cn': '开启背景全屏',
        'zh-tw': '開啟背景全螢幕',
        'en': 'Enable Fullscreen',
        'ko': '전체 화면 켜기',
        'ja': '全画面表示を有効にする',
        'fr': 'Activer le plein écran'
      },
      'exitFullscreen': {
        'zh': '退出背景全屏',
        'zh-cn': '退出背景全屏',
        'zh-tw': '退出背景全螢幕',
        'en': 'Exit Fullscreen',
        'ko': '전체 화면 끄기',
        'ja': '全画面表示を終了',
        'fr': 'Quitter le plein écran'
      },
      'exitAllFullscreen': {
        'zh': '退出全部全屏',
        'zh-cn': '退出全部全屏',
        'zh-tw': '退出全部全螢幕',
        'en': 'Exit All Fullscreen',
        'ko': '모든 전체 화면 종료',
        'ja': 'すべての全画面表示を終了',
        'fr': 'Quitter tous les pleins écrans'
      },
      'downloadBtnText': {
        'zh': '下载今日必应图片',
        'zh-cn': '下载今日必应图片',
        'zh-tw': '下載今日必應圖片',
        'en': "Download Today's Bing Image",
        'ko': '오늘의 Bing 이미지 다운로드',
        'ja': '今日のBing画像をダウンロード',
        'fr': "Télécharger l'image Bing du jour"
      },
      'settings': {
        'zh': '设置',
        'zh-cn': '设置',
        'zh-tw': '設定',
        'en': 'Settings',
        'ko': '설정',
        'ja': '設定',
        'fr': 'Paramètres'
      },
      'imageInfo': {
        'zh': '图片信息',
        'zh-cn': '图片信息',
        'zh-tw': '圖片資訊',
        'en': 'Image Info',
        'ko': '이미지 정보',
        'ja': '画像情報',
        'fr': 'Infos image'
      },
      'imageResolution': {
        'zh': '图片分辨率',
        'zh-cn': '图片分辨率',
        'zh-tw': '圖片解析度',
        'en': 'Image Resolution',
        'ko': '이미지 해상도',
        'ja': '画像解像度',
        'fr': 'Résolution'
      },
      'namingRules': {
        'zh': '命名规则',
        'zh-cn': '命名规则',
        'zh-tw': '命名規則',
        'en': 'Naming Rules',
        'ko': '이름 규칙',
        'ja': '命名規則',
        'fr': 'Règles de nommage'
      },
      'baseName': {
        'zh': '基础名称',
        'zh-cn': '基础名称',
        'zh-tw': '基礎名稱',
        'en': 'Base Name',
        'ko': '기본 이름',
        'ja': '基本名',
        'fr': 'Nom de base'
      },
      'dateInfo': {
        'zh': '日期信息',
        'zh-cn': '日期信息',
        'zh-tw': '日期資訊',
        'en': 'Date Info',
        'ko': '날짜 정보',
        'ja': '日付情報',
        'fr': 'Date'
      },
      'description': {
        'zh': '图片描述',
        'zh-cn': '图片描述',
        'zh-tw': '圖片描述',
        'en': 'Description',
        'ko': '설명',
        'ja': '説明',
        'fr': 'Description'
      },
      'copyright': {
        'zh': '版权信息',
        'zh-cn': '版权信息',
        'zh-tw': '版權資訊',
        'en': 'Copyright',
        'ko': '저작권',
        'ja': '著作権',
        'fr': 'Copyright'
      },
      'imgNO': {
        'zh': '图片编号',
        'zh-cn': '图片编号',
        'zh-tw': '圖片編號',
        'en': 'Image Number',
        'ko': '이미지 번호',
        'ja': '画像番号',
        'fr': 'Numéro'
      },
      'imgResolution': {
        'zh': '分辨率',
        'zh-cn': '分辨率',
        'zh-tw': '解析度',
        'en': 'Resolution',
        'ko': '해상도',
        'ja': '解像度',
        'fr': 'Résolution'
      },
      'separator': {
        'zh': '连接符',
        'zh-cn': '连接符',
        'zh-tw': '連接符',
        'en': 'Separator',
        'ko': '구분자',
        'ja': '区切り文字',
        'fr': 'Séparateur'
      },
      'save': {
        'zh': '保存',
        'zh-cn': '保存',
        'zh-tw': '儲存',
        'en': 'Save',
        'ko': '저장',
        'ja': '保存',
        'fr': 'Enregistrer'
      },
      'cancel': {
        'zh': '取消',
        'zh-cn': '取消',
        'zh-tw': '取消',
        'en': 'Cancel',
        'ko': '취소',
        'ja': 'キャンセル',
        'fr': 'Annuler'
      },
      'reset': {
        'zh': '重置',
        'zh-cn': '重置',
        'zh-tw': '重設',
        'en': 'Reset',
        'ko': '재설정',
        'ja': 'リセット',
        'fr': 'Réinitialiser'
      },
      'rightClickSettings': {
        'zh': '右键打开设置菜单',
        'zh-cn': '右键打开设置菜单',
        'zh-tw': '右鍵開啟設定選單',
        'en': 'Right click to open settings',
        'ko': '설정 메뉴를 열려면 우클릭',
        'ja': '右クリックで設定メニューを開く',
        'fr': 'Clic droit pour ouvrir les paramètres'
      }
    };
    
    const textMap = texts[key];
    if (!textMap) return key;
    
    // 尝试匹配完整语言代码
    if (textMap[this.currentLang]) {
      return textMap[this.currentLang];
    }
    
    // 尝试匹配语言前缀
    const langPrefix = this.currentLang.split('-')[0];
    if (textMap[langPrefix]) {
      return textMap[langPrefix];
    }
    
    // 默认返回英文
    return textMap['en'] || key;
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BTI18n;
}
