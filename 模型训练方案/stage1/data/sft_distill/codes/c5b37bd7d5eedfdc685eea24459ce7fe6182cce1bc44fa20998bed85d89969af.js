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

let hexagon;
let cursors;
const SPEED = 120;

function preload() {
  // 预加载阶段（本例中不需要加载外部资源）
}

function create() {
  // 使用 Graphics 绘制白色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制六边形（正六边形，半径30）
  const radius = 30;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = radius * Math.cos(angle * i - Math.PI / 2);
    const y = radius * Math.sin(angle * i - Math.PI / 2);
    if (i === 0) {
      graphics.moveTo(x + radius, y + radius);
    } else {
      graphics.lineTo(x + radius, y + radius);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在画布中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置键盘方向键
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键更新位置
  if (cursors.left.isDown) {
    hexagon.x -= distance;
  }
  if (cursors.right.isDown) {
    hexagon.x += distance;
  }
  if (cursors.up.isDown) {
    hexagon.y -= distance;
  }
  if (cursors.down.isDown) {
    hexagon.y += distance;
  }
  
  // 限制在画布边界内（考虑六边形的半径30）
  const halfWidth = hexagon.width / 2;
  const halfHeight = hexagon.height / 2;
  
  hexagon.x = Phaser.Math.Clamp(hexagon.x, halfWidth, config.width - halfWidth);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);