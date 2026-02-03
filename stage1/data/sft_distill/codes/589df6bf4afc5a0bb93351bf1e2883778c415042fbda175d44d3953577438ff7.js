const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let rectangle;
let rectX = 400;
let rectY = 300;
const followSpeed = 360; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建黄色矩形
  rectangle = this.add.graphics();
  rectangle.fillStyle(0xffff00, 1); // 黄色
  rectangle.fillRect(-25, -25, 50, 50); // 中心点在(0,0)，尺寸50x50
  
  // 设置初始位置
  rectangle.setPosition(rectX, rectY);
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse!', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  const targetX = pointer.x;
  const targetY = pointer.y;
  
  // 计算当前位置到目标位置的距离
  const dx = targetX - rectX;
  const dy = targetY - rectY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 如果距离很小，直接到达目标位置
  if (distance < 1) {
    rectX = targetX;
    rectY = targetY;
  } else {
    // 计算移动距离（速度 * 时间增量，delta单位是毫秒）
    const moveDistance = followSpeed * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达
    if (moveDistance >= distance) {
      rectX = targetX;
      rectY = targetY;
    } else {
      // 按比例移动
      const ratio = moveDistance / distance;
      rectX += dx * ratio;
      rectY += dy * ratio;
    }
  }
  
  // 更新矩形位置
  rectangle.setPosition(rectX, rectY);
}

new Phaser.Game(config);