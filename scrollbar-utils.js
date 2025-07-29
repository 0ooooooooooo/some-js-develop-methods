// 创建一个外层容器 div，用来计算滚动条宽度
const outer = document.createElement('div');

// 设置样式，使容器不可见且不影响布局，放置页面外面
Object.assign(outer.style, {
  visibility: 'hidden',
  width: '100px',
  position: 'absolute',
  top: '-9999px',
  overflow: 'hidden'  // 初始不显示滚动条
});

// 将外层容器添加到页面 body 中，必须插入才能测量尺寸
document.body.appendChild(outer);

// 获取外层容器的宽度（不包含滚动条）
const scrollOutWidth = outer.offsetWidth;

// 使外层容器出现滚动条
outer.style.overflow = 'scroll';

// 创建内层容器 div，大小设置为100%填满外层容器
const inner = document.createElement('div');
Object.assign(inner.style, {
  height: '100%',
  width: '100%'
});

// 将内层容器添加到外层容器中
outer.appendChild(inner);

// 计算滚动条宽度 = 外层容器宽度 - 内层容器宽度
// 因为内层宽度不包括滚动条宽度，差值就是滚动条宽度
const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

// 清理操作，移除临时添加到 DOM 的外层容器
document.body.removeChild(outer);

console.log('浏览器滚动条宽度:', scrollbarWidth);


// 说明
// 为什么要隐藏元素并放到页面外？
// 避免影响页面布局和视觉效果。

// 为什么需要内层元素？
// 因为外层元素加滚动条后宽度不变，但内部可视宽度会减去滚动条宽度，通过差值计算滚动条宽度。

// 为什么不能直接用 offsetWidth ？
// offsetWidth 包含边框和滚动条，通过减去内层元素的宽度得到滚动条实际占用的空间。
