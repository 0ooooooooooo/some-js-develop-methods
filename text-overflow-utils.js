// Function 1
// 创建文档片段获取长度对比实际长度
const child = document.getElementsByClassName(className)[0];
// 创建文档片段
const range = document.createRange();
range.setStart(child, 0);
range.setEnd(child, child.childNodes.length);
// 获取文档片段的长度
const rangeWidth = range.getBoundingClientRect().width;
// 获取目标实际长度，针对text-overflow: ellipsis;
const offsetWidth = child.offsetWidth;
if (rangeWidth > offsetWidth) ... 
else ...


// Function 2
// 创建元素/伪元素，事件交互将innerText放入创建元素中，对比当前操作元素和创建元素宽度
// 创建元素
const insetSpan = document.createElement('span');
insetSpan.id = 'inset';
document.body.append(insetSpan);
// or
// :after{
// 	context: attr(attribute name);
//   visibility: hidden;
// }
// 事件获取操作元素长度,处理对比信息
target.event(el => {
	insetSpan.innerText = el.innerText;
  const {offsetWidth} = insetSpan;
  const targetWidth = el.currentTarget.offsetWidth;
  const diff = offsetWidth - targetWidth;
  if (diff > 0) ...
  else ...
});
