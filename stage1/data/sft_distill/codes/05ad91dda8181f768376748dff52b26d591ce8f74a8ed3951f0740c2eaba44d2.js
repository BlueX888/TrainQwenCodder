const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let rectangle;
let pointer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建绿色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('greenRect', 50, 50);
  graphics.destroy();

  // 创建矩形精灵，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'greenRect');
  rectangle.setOrigin(0.5, 0.5);

  // 获取鼠标指针引用
  pointer = this.input.activePointer;

  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse!', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算跟随速度（基于帧时间归一化）
  // 速度80表示每秒移动的像素比例，需要转换为每帧的移动量
  const followSpeed = 80 * (delta / 1000);

  // 计算目标位置与当前位置的差值
  const dx = pointer.x - rectangle.x;
  const dy = pointer.y - rectangle.y;

  // 计算距离
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 如果距离大于阈值，进行平滑移动
  if (distance > 1) {
    // 使用线性插值实现平滑跟随
    // 移动距离 = min(followSpeed, distance)，避免超过目标
    const moveDistance = Math.min(followSpeed, distance);
    
    // 归一化方向向量并乘以移动距离
    rectangle.x += (dx / distance) * moveDistance;
    rectangle.y += (dy / distance) * moveDistance;
  }
}

new Phaser.Game(config);