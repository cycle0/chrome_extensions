// ==UserScript==
// @name         Bing背景全屏显示(带浏览器全屏切换)
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  使Bing页面背景图片全屏显示，并可通过按钮切换开关和浏览器全屏
// @author       Your Name
// @match        https://*.bing.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // 存储原始页面状态和元素
    let originalState = {
        elements: new Map(),
        styles: new Map()
    };

    // 是否处于全屏模式
    let isFullscreenMode = false;
    // 是否处于浏览器全屏模式
    let isBrowserFullscreen = false;

    // 等待页面完全加载
    window.addEventListener('load', function() {
        // 添加切换按钮
        createToggleButton();

        // 检查上次状态
        const savedState = GM_getValue('bingFullscreenEnabled', false);
        if (savedState) {
            toggleFullscreenMode();
        }

        // 监听浏览器全屏状态变化
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    });

    // 处理浏览器全屏状态变化
    function handleFullscreenChange() {
        isBrowserFullscreen = !!(document.fullscreenElement ||
                                document.webkitFullscreenElement ||
                                document.mozFullScreenElement ||
                                document.msFullscreenElement);

        const toggleButton = document.getElementById('bingFullscreenToggle');
        if (toggleButton) {
            toggleButton.textContent = isFullscreenMode ?
                (isBrowserFullscreen ? '退出全部全屏' : '退出背景全屏') :
                '开启背景全屏';
        }
    }

    // 创建切换按钮
    function createToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'bingFullscreenToggle';
        toggleButton.textContent = '开启背景全屏';
        toggleButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 10000;
            padding: 8px 16px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s;
        `;

        toggleButton.addEventListener('mouseover', () => {
            toggleButton.style.opacity = '1';
        });

        toggleButton.addEventListener('mouseout', () => {
            toggleButton.style.opacity = '0.7';
        });

        toggleButton.addEventListener('click', toggleFullscreenMode);

        document.body.appendChild(toggleButton);
    }

    // 切换全屏模式
    function toggleFullscreenMode() {
        const toggleButton = document.getElementById('bingFullscreenToggle');

        if (isFullscreenMode) {
            // 从全屏模式恢复
            restoreOriginalState();

            // 如果浏览器处于全屏状态，也退出浏览器全屏
            if (isBrowserFullscreen) {
                exitBrowserFullscreen();
            }

            if (toggleButton) toggleButton.textContent = '开启背景全屏';
            isFullscreenMode = false;
            GM_setValue('bingFullscreenEnabled', false);
        } else {
            // 进入全屏模式
            makeBingBackgroundFullscreen();

            // 同时进入浏览器全屏模式
            requestBrowserFullscreen(document.documentElement);

            if (toggleButton) toggleButton.textContent = '退出全部全屏';
            isFullscreenMode = true;
            GM_setValue('bingFullscreenEnabled', true);
        }
    }

    // 请求浏览器全屏
    function requestBrowserFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 退出浏览器全屏
    function exitBrowserFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // 保存原始状态
    function saveOriginalState() {
        // 保存所有可见元素的原始显示状态
        const allElements = document.body.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.id !== 'bingFullscreenToggle' && el.id !== 'fullscreenBingBackground') {
                const computedStyle = window.getComputedStyle(el);
                originalState.elements.set(el, {
                    display: computedStyle.display
                });
            }
        });

        // 保存原始body和html样式
        const bodyStyle = window.getComputedStyle(document.body);
        originalState.styles.set('body', {
            overflow: bodyStyle.overflow,
            overflowX: bodyStyle.overflowX,
            overflowY: bodyStyle.overflowY,
            margin: bodyStyle.margin,
            padding: bodyStyle.padding
        });

        const htmlStyle = window.getComputedStyle(document.documentElement);
        originalState.styles.set('html', {
            overflow: htmlStyle.overflow,
            overflowX: htmlStyle.overflowX,
            overflowY: htmlStyle.overflowY,
            margin: htmlStyle.margin,
            padding: htmlStyle.padding
        });
    }

    // 恢复原始状态
    function restoreOriginalState() {
        // 移除全屏背景
        const fullscreenBg = document.getElementById('fullscreenBingBackground');
        if (fullscreenBg) {
            fullscreenBg.remove();
        }

        // 移除全屏样式
        const fullscreenStyle = document.getElementById('bingFullscreenStyle');
        if (fullscreenStyle) {
            fullscreenStyle.remove();
        }

        // 恢复原始元素显示状态
        originalState.elements.forEach((props, element) => {
            if (element && typeof element.style !== 'undefined') {
                // 只恢复display属性
                element.style.display = '';
            }
        });

        // 恢复body和html样式
        if (originalState.styles.has('body')) {
            const bodyProps = originalState.styles.get('body');
            document.body.style.overflow = '';
            document.body.style.overflowX = '';
            document.body.style.overflowY = '';
            document.body.style.margin = '';
            document.body.style.padding = '';
        }

        if (originalState.styles.has('html')) {
            const htmlProps = originalState.styles.get('html');
            document.documentElement.style.overflow = '';
            document.documentElement.style.overflowX = '';
            document.documentElement.style.overflowY = '';
            document.documentElement.style.margin = '';
            document.documentElement.style.padding = '';
        }

        // 重置原始状态存储
        originalState = {
            elements: new Map(),
            styles: new Map()
        };
    }

    // 主函数 - 全屏背景
    function makeBingBackgroundFullscreen() {
        // 先保存原始状态
        saveOriginalState();

        // 查找背景图片元素
        const backgroundImageElement = document.querySelector('.img_cont') ||
                                      document.querySelector('#bgDiv') ||
                                      document.getElementById('b_sydBgCont');

        if (!backgroundImageElement) {
            console.log('无法找到Bing背景图片元素');
            // 如果找不到背景元素，每秒尝试一次，最多尝试10次
            let attempts = 0;
            const interval = setInterval(() => {
                const bgElement = document.querySelector('.img_cont') ||
                                 document.querySelector('#bgDiv') ||
                                 document.getElementById('b_sydBgCont');
                attempts++;
                if (bgElement || attempts > 10) {
                    clearInterval(interval);
                    if (bgElement) {
                        applyFullscreenStyles(bgElement);
                    } else {
                        // 如果找不到元素，恢复原状
                        restoreOriginalState();
                        isFullscreenMode = false;
                        const toggleButton = document.getElementById('bingFullscreenToggle');
                        if (toggleButton) toggleButton.textContent = '开启背景全屏';

                        // 如果浏览器处于全屏状态，也退出浏览器全屏
                        if (isBrowserFullscreen) {
                            exitBrowserFullscreen();
                        }
                    }
                }
            }, 1000);
            return;
        }

        applyFullscreenStyles(backgroundImageElement);
    }

    // 应用全屏样式
    function applyFullscreenStyles(element) {
        // 创建新的全屏样式
        const style = document.createElement('style');
        style.id = 'bingFullscreenStyle';
        style.textContent = `
            /* 确保整个页面没有滚动条 */
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                overscroll-behavior: none !important;
                height: 100% !important;
                width: 100% !important;
                max-height: 100% !important;
                max-width: 100% !important;
            }

            /* 隐藏所有滚动条 */
            ::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
            }

            /* 确保没有任何元素超出视窗 */
            * {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
            }

            /* 隐藏所有其他内容 */
            body > *:not(#bingFullscreenToggle):not(#fullscreenBingBackground) {
                display: none !important;
            }

            /* 显示并设置背景容器样式 */
            #fullscreenBingBackground {
                display: block !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 9998 !important;
                background-size: cover !important;
                background-position: center center !important;
                background-repeat: no-repeat !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                overflow: hidden !important;
            }

            /* 确保按钮始终在最上层 */
            #bingFullscreenToggle {
                z-index: 10000 !important;
            }
        `;
        document.head.appendChild(style);

        // 提取背景图片的URL
        let backgroundImageUrl = '';

        // 尝试从不同可能的元素中获取背景图片
        if (element.style.backgroundImage) {
            backgroundImageUrl = element.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
        } else {
            const imgElement = element.querySelector('img');
            if (imgElement && imgElement.src) {
                backgroundImageUrl = imgElement.src;
            }
        }

        if (!backgroundImageUrl) {
            // 如果未能直接获取，尝试从计算样式获取
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
                backgroundImageUrl = computedStyle.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            }
        }

        // 创建全屏背景元素
        const fullscreenBackground = document.createElement('div');
        fullscreenBackground.id = 'fullscreenBingBackground';

        if (backgroundImageUrl) {
            fullscreenBackground.style.backgroundImage = `url('${backgroundImageUrl}')`;
        } else {
            // 如果无法获取背景图片，则克隆元素
            fullscreenBackground.appendChild(element.cloneNode(true));
        }

        // 添加到页面
        document.body.appendChild(fullscreenBackground);

        // 添加ESC键返回功能
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isFullscreenMode) {
                toggleFullscreenMode();
            }
        });

        // 添加额外的脚本来强制消除滚动条
        setTimeout(() => {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.documentElement.style.margin = '0';
            document.documentElement.style.padding = '0';
            document.body.style.margin = '0';
            document.body.style.padding = '0';
        }, 100);
    }
})();
