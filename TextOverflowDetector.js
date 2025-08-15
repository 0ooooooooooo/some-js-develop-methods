/**
 * TextOverflowDetector - 文本溢出检测器
 * 用于检测元素文本是否因 text-overflow: ellipsis 而被截断
 */
class TextOverflowDetector {
  // 缓存测量元素，避免重复创建
  static _measureElement = null;
  
  /**
   * 方法一：使用 Range API 检测文本溢出
   * 适用于已渲染的元素，性能较好
   * @param {HTMLElement|string} target - 目标元素或选择器
   * @returns {Object} 检测结果
   */
  static detectByRange(target) {
    const element = this._getElement(target);
    if (!element) {
      return this._createResult(false, 'Element not found');
    }
    
    if (!element.childNodes.length) {
      return this._createResult(false, 'No text content');
    }
    
    try {
      // 创建范围选择所有子节点
      const range = document.createRange();
      range.setStart(element, 0);
      range.setEnd(element, element.childNodes.length);
      
      // 获取文本实际宽度和容器宽度
      const textWidth = range.getBoundingClientRect().width;
      const containerWidth = element.offsetWidth;
      
      // 考虑 padding 的影响
      const computedStyle = window.getComputedStyle(element);
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
      const availableWidth = containerWidth - paddingLeft - paddingRight;
      
      const isOverflowing = textWidth > availableWidth;
      const overflowAmount = Math.max(0, textWidth - availableWidth);
      
      return this._createResult(isOverflowing, null, {
        textWidth: Math.round(textWidth),
        containerWidth,
        availableWidth: Math.round(availableWidth),
        overflowAmount: Math.round(overflowAmount)
      });
      
    } catch (error) {
      return this._createResult(false, `Range detection failed: ${error.message}`);
    }
  }
  
  /**
   * 方法二：使用克隆元素检测文本溢出
   * 适用于动态文本检测，更准确但性能稍差
   * @param {HTMLElement|string} target - 目标元素或选择器
   * @param {string} text - 可选：指定要检测的文本内容
   * @returns {Object} 检测结果
   */
  static detectByClone(target, text = null) {
    const element = this._getElement(target);
    if (!element) {
      return this._createResult(false, 'Element not found');
    }
    
    const testText = text || element.textContent || element.innerText;
    if (!testText.trim()) {
      return this._createResult(false, 'No text content');
    }
    
    try {
      // 获取或创建测量元素
      const measureElement = this._getMeasureElement();
      
      // 复制目标元素的样式
      this._copyTextStyles(element, measureElement);
      
      // 设置测试文本
      measureElement.textContent = testText;
      
      // 添加到 DOM 进行测量
      document.body.appendChild(measureElement);
      
      const textWidth = measureElement.offsetWidth;
      const containerWidth = element.offsetWidth;
      
      // 考虑 padding 的影响
      const computedStyle = window.getComputedStyle(element);
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
      const availableWidth = containerWidth - paddingLeft - paddingRight;
      
      const isOverflowing = textWidth > availableWidth;
      const overflowAmount = Math.max(0, textWidth - availableWidth);
      
      // 清理 DOM
      document.body.removeChild(measureElement);
      
      return this._createResult(isOverflowing, null, {
        textWidth,
        containerWidth,
        availableWidth: Math.round(availableWidth),
        overflowAmount: Math.round(overflowAmount),
        textLength: testText.length
      });
      
    } catch (error) {
      // 确保清理 DOM
      if (this._measureElement && this._measureElement.parentNode) {
        document.body.removeChild(this._measureElement);
      }
      return this._createResult(false, `Clone detection failed: ${error.message}`);
    }
  }
  
  /**
   * 智能检测：自动选择最佳检测方法
   * @param {HTMLElement|string} target - 目标元素或选择器
   * @param {string} text - 可选：指定要检测的文本内容
   * @returns {Object} 检测结果
   */
  static detect(target, text = null) {
    // 如果指定了文本内容，使用克隆方法
    if (text) {
      return this.detectByClone(target, text);
    }
    
    // 否则优先使用 Range 方法（性能更好）
    const rangeResult = this.detectByRange(target);
    
    // 如果 Range 方法失败，回退到克隆方法
    if (rangeResult.error) {
      return this.detectByClone(target);
    }
    
    return rangeResult;
  }
  
  /**
   * 批量检测多个元素
   * @param {Array<HTMLElement|string>} targets - 目标元素数组
   * @returns {Array<Object>} 检测结果数组
   */
  static detectMultiple(targets) {
    return targets.map(target => this.detect(target));
  }
  
  /**
   * 监听元素文本变化并检测溢出
   * @param {HTMLElement|string} target - 目标元素或选择器
   * @param {Function} callback - 回调函数
   * @param {Object} options - 选项
   * @returns {MutationObserver} 返回观察者对象，用于停止监听
   */
  static observe(target, callback, options = {}) {
    const element = this._getElement(target);
    if (!element) {
      throw new Error('Element not found');
    }
    
    const { immediate = true, debounce = 100 } = options;
    
    let timeoutId;
    const debouncedCallback = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const result = this.detect(element);
        callback(result, element);
      }, debounce);
    };
    
    // 立即执行一次
    if (immediate) {
      debouncedCallback();
    }
    
    // 创建观察者
    const observer = new MutationObserver(debouncedCallback);
    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    return observer;
  }
  
  /**
   * 获取或创建测量元素
   * @private
   * @returns {HTMLElement} 测量元素
   */
  static _getMeasureElement() {
    if (!this._measureElement) {
      this._measureElement = document.createElement('span');
      this._measureElement.style.cssText = `
        position: absolute !important;
        visibility: hidden !important;
        white-space: nowrap !important;
        top: -9999px !important;
        left: -9999px !important;
        pointer-events: none !important;
      `;
    }
    return this._measureElement.cloneNode();
  }
  
  /**
   * 复制文本相关样式
   * @private
   * @param {HTMLElement} source - 源元素
   * @param {HTMLElement} target - 目标元素
   */
  static _copyTextStyles(source, target) {
    const computedStyle = window.getComputedStyle(source);
    const textStyleProps = [
      'font-family', 'font-size', 'font-weight', 'font-style',
      'letter-spacing', 'word-spacing', 'text-transform'
    ];
    
    textStyleProps.forEach(prop => {
      target.style[prop] = computedStyle[prop];
    });
  }
  
  /**
   * 获取元素（支持选择器）
   * @private
   * @param {HTMLElement|string} target - 元素或选择器
   * @returns {HTMLElement|null} 元素
   */
  static _getElement(target) {
    if (typeof target === 'string') {
      return document.querySelector(target);
    }
    return target instanceof HTMLElement ? target : null;
  }
  
  /**
   * 创建统一的结果对象
   * @private
   * @param {boolean} isOverflowing - 是否溢出
   * @param {string} error - 错误信息
   * @param {Object} details - 详细信息
   * @returns {Object} 结果对象
   */
  static _createResult(isOverflowing, error = null, details = {}) {
    return {
      isOverflowing,
      error,
      ...details,
      timestamp: Date.now()
    };
  }
  
  /**
   * 清理资源
   */
  static cleanup() {
    if (this._measureElement && this._measureElement.parentNode) {
      document.body.removeChild(this._measureElement);
    }
    this._measureElement = null;
  }
}

// 便捷函数
function isTextOverflowing(target, text = null) {
  return TextOverflowDetector.detect(target, text).isOverflowing;
}

// 导出到全局作用域
window.TextOverflowDetector = TextOverflowDetector;
window.isTextOverflowing = isTextOverflowing;

// 使用示例
console.log('=== TextOverflowDetector 使用示例 ===');

// 基本用法
// const result = TextOverflowDetector.detect('.my-text');
// console.log('是否溢出:', result.isOverflowing);

// 监听文本变化
// const observer = TextOverflowDetector.observe('.my-text', (result) => {
//   console.log('文本溢出状态:', result.isOverflowing);
// });

// 停止监听: observer.disconnect();
