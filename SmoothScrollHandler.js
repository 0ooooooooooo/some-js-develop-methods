/**
 * 配置：按钮ID和对应的目标元素ID映射
 */
const SCROLL_CONFIG = [
  { buttonId: 'concat-us-position', targetId: 'concat-us-box' }
  // 可以轻松添加更多映射
  // { buttonId: 'another-button', targetId: 'another-target' }
];

/**
 * 平滑滚动到目标元素
 * @param {HTMLElement} targetElement - 目标元素
 * @param {Object} options - 滚动选项
 */
function scrollToElement(targetElement, options = {}) {
  if (!targetElement) {
    console.warn('目标元素不存在');
    return;
  }
  
  const defaultOptions = {
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  };
  
  targetElement.scrollIntoView({ ...defaultOptions, ...options });
}

/**
 * 初始化滚动事件监听器
 */
function initScrollHandlers() {
  SCROLL_CONFIG.forEach(({ buttonId, targetId }) => {
    const button = document.getElementById(buttonId);
    const target = document.getElementById(targetId);
    
    // 检查元素是否存在
    if (!button) {
      console.warn(`按钮元素不存在: ${buttonId}`);
      return;
    }
    
    if (!target) {
      console.warn(`目标元素不存在: ${targetId}`);
      return;
    }
    
    // 添加点击事件监听器
    button.addEventListener('click', (event) => {
      event.preventDefault(); // 防止默认行为
      console.log(`点击了按钮: ${buttonId}`);
      scrollToElement(target);
    });
    
    console.log(`已绑定滚动事件: ${buttonId} -> ${targetId}`);
  });
}

/**
 * 等待DOM加载完成后初始化
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollHandlers);
} else {
  initScrollHandlers();
}

// 导出函数供外部使用（如果需要）
window.ScrollHandler = {
  init: initScrollHandlers,
  scrollTo: scrollToElement,
  addMapping: (buttonId, targetId) => {
    SCROLL_CONFIG.push({ buttonId, targetId });
  }
};
