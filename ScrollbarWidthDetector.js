/**
 * ScrollbarWidthDetector - 浏览器滚动条宽度检测器
 * 用于准确获取当前浏览器环境下滚动条的宽度
 */
class ScrollbarWidthDetector {
  // 缓存滚动条宽度，避免重复计算
  static _cachedWidth = null;
  
  /**
   * 获取滚动条宽度
   * @param {boolean} useCache - 是否使用缓存，默认为 true
   * @returns {number} 滚动条宽度（像素）
   */
  static getWidth(useCache = true) {
    // 如果启用缓存且已有缓存值，直接返回
    if (useCache && this._cachedWidth !== null) {
      return this._cachedWidth;
    }
    
    const width = this._measureScrollbarWidth();
    
    // 缓存结果
    if (useCache) {
      this._cachedWidth = width;
    }
    
    return width;
  }
  
  /**
   * 实际测量滚动条宽度的核心方法
   * @private
   * @returns {number} 滚动条宽度
   */
  static _measureScrollbarWidth() {
    // 创建外层测试容器
    const outer = document.createElement('div');
    this._setContainerStyles(outer, {
      visibility: 'hidden',
      width: '100px',
      height: '100px',
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
      overflow: 'hidden',
      msOverflowStyle: 'scrollbar' // 确保 IE 显示滚动条
    });
    
    // 添加到 DOM 进行测量
    document.body.appendChild(outer);
    
    try {
      // 记录无滚动条时的宽度
      const widthWithoutScrollbar = outer.offsetWidth;
      
      // 启用滚动条
      outer.style.overflow = 'scroll';
      
      // 创建内层容器填满外层
      const inner = document.createElement('div');
      this._setContainerStyles(inner, {
        width: '100%',
        height: '100%'
      });
      
      outer.appendChild(inner);
      
      // 计算滚动条宽度
      const widthWithScrollbar = inner.offsetWidth;
      const scrollbarWidth = widthWithoutScrollbar - widthWithScrollbar;
      
      return Math.max(0, scrollbarWidth); // 确保不返回负值
      
    } finally {
      // 确保清理 DOM，即使出错也要执行
      document.body.removeChild(outer);
    }
  }
  
  /**
   * 设置元素样式的辅助方法
   * @private
   * @param {HTMLElement} element - 目标元素
   * @param {Object} styles - 样式对象
   */
  static _setContainerStyles(element, styles) {
    Object.assign(element.style, styles);
  }
  
  /**
   * 清除缓存的滚动条宽度
   * 在页面缩放或主题切换后可能需要重新测量
   */
  static clearCache() {
    this._cachedWidth = null;
  }
  
  /**
   * 检测当前环境是否有滚动条
   * @returns {boolean} 是否存在滚动条
   */
  static hasScrollbar() {
    return this.getWidth() > 0;
  }
  
  /**
   * 获取滚动条信息对象
   * @returns {Object} 包含宽度和是否存在的信息
   */
  static getInfo() {
    const width = this.getWidth();
    return {
      width,
      exists: width > 0,
      type: this._getScrollbarType(width)
    };
  }
  
  /**
   * 根据宽度判断滚动条类型
   * @private
   * @param {number} width - 滚动条宽度
   * @returns {string} 滚动条类型
   */
  static _getScrollbarType(width) {
    if (width === 0) return 'none';
    if (width <= 8) return 'thin';
    if (width <= 12) return 'normal';
    return 'thick';
  }
}

// 便捷的全局函数
function getScrollbarWidth() {
  return ScrollbarWidthDetector.getWidth();
}

// 导出到全局作用域
window.ScrollbarWidthDetector = ScrollbarWidthDetector;
window.getScrollbarWidth = getScrollbarWidth;

// 使用示例和测试
console.log('=== ScrollbarWidthDetector 测试 ===');
console.log('滚动条宽度:', ScrollbarWidthDetector.getWidth(), 'px');
console.log('是否有滚动条:', ScrollbarWidthDetector.hasScrollbar());
console.log('滚动条信息:', ScrollbarWidthDetector.getInfo());

// 性能测试：多次调用验证缓存机制
console.time('首次测量');
ScrollbarWidthDetector.getWidth();
console.timeEnd('首次测量');

console.time('缓存调用');
ScrollbarWidthDetector.getWidth();
console.timeEnd('缓存调用');

// CSS 变量设置示例（可选）
if (typeof CSS !== 'undefined' && CSS.supports('--custom-property', '0')) {
  document.documentElement.style.setProperty(
    '--scrollbar-width', 
    `${ScrollbarWidthDetector.getWidth()}px`
  );
  console.log('已设置 CSS 变量 --scrollbar-width');
}
