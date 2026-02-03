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

let diamond;
const ROTATION_SPEED = 160; // 每秒旋转160度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建容器用于旋转
  diamond = this.add.container(400, 300);
  
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形样式
  graphics.fillStyle(0x00ffff, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  // 绘制菱形（四个顶点）
  const size = 80;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  
  // 填充和描边
  graphics.fillPath();
  graphics.strokePath();
  
  // 将 graphics 添加到容器中
  diamond.add(graphics);
  
  // 添加提示文本
  this.add.text(400, 50, '菱形旋转速度: 160°/秒', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 根据 delta 时间计算旋转增量
  // delta 单位是毫秒，需要转换为秒
  const rotationDelta = ROTATION_SPEED * (delta / 1000);
  
  // 累加旋转角度（angle 属性使用度数）
  diamond.angle += rotationDelta;
  
  // 可选：防止角度值无限增长
  if (diamond.angle >= 360) {
    diamond.angle -= 360;
  }
}

new Phaser.Game(config);