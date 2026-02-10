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
  // 使用 Graphics 绘制蓝色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 60, 40); // 60x40 的矩形
  graphics.generateTexture('blueRect', 60, 40);
  graphics.destroy();

  // 创建矩形精灵，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'blueRect');
  rectangle.setOrigin(0.5, 0.5);

  // 获取鼠标指针
  pointer = this.input.activePointer;

  // 显示提示文本
  this.add.text(10, 10, 'Move your mouse to see the rectangle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算跟随速度（速度值80转换为每秒移动的像素数）
  // delta 是毫秒，需要转换为秒
  const followSpeed = 80;
  const speedFactor = followSpeed * (delta / 1000);

  // 计算当前位置到目标位置的距离
  const dx = pointer.x - rectangle.x;
  const dy = pointer.y - rectangle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 如果距离大于阈值，则进行平滑跟随
  if (distance > 1) {
    // 使用线性插值实现平滑跟随
    // 限制每帧移动距离不超过实际距离
    const moveDistance = Math.min(speedFactor, distance);
    const ratio = moveDistance / distance;

    rectangle.x += dx * ratio;
    rectangle.y += dy * ratio;
  }
}

new Phaser.Game(config);