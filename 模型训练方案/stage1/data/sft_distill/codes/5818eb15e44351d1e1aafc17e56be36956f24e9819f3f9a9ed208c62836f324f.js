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

let circle;
let pointer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();

  // 创建圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'redCircle');

  // 获取指针对象
  pointer = this.input.activePointer;

  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the circle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算跟随速度（每秒80像素）
  // delta 是毫秒，需要转换为秒
  const speed = 80;
  const distance = speed * (delta / 1000);

  // 计算当前位置到目标位置的距离
  const dx = pointer.x - circle.x;
  const dy = pointer.y - circle.y;
  const totalDistance = Math.sqrt(dx * dx + dy * dy);

  // 如果距离大于移动距离，则按速度移动；否则直接到达目标位置
  if (totalDistance > distance) {
    // 计算移动比例
    const ratio = distance / totalDistance;
    circle.x += dx * ratio;
    circle.y += dy * ratio;
  } else {
    // 距离很近时直接设置到目标位置
    circle.x = pointer.x;
    circle.y = pointer.y;
  }
}

new Phaser.Game(config);