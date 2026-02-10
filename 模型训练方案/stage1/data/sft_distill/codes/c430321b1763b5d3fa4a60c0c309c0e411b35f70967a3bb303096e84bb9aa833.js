const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let rectangle;
let pointer;
const followSpeed = 80;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建绿色矩形
  rectangle = this.add.graphics();
  rectangle.fillStyle(0x00ff00, 1);
  rectangle.fillRect(-25, -25, 50, 50); // 以中心点为原点绘制 50x50 的矩形
  
  // 设置初始位置为屏幕中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算跟随速度（转换为每秒像素到每毫秒像素）
  const speed = followSpeed * (delta / 1000);
  
  // 计算当前位置到目标位置的距离
  const dx = pointer.x - rectangle.x;
  const dy = pointer.y - rectangle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 如果距离大于速度，则按速度移动；否则直接到达目标位置
  if (distance > speed) {
    // 归一化方向向量并乘以速度
    rectangle.x += (dx / distance) * speed;
    rectangle.y += (dy / distance) * speed;
  } else {
    // 距离很近时直接设置为目标位置，避免抖动
    rectangle.x = pointer.x;
    rectangle.y = pointer.y;
  }
}

new Phaser.Game(config);