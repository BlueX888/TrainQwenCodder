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
let keys;
const SPEED = 300; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 30;
  const hexColor = 0x00ff00;
  
  // 绘制六边形
  graphics.fillStyle(hexColor, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 计算六边形的六个顶点（中心在原点）
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角度 60 度
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制多边形
  const polygon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(polygon.points, true);
  graphics.strokePoints(polygon.points, true);
  
  // 生成纹理（大小需要能容纳六边形）
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy();
  
  // 创建六边形精灵并放置在屏幕中央
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置 WASD 键
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the hexagon', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态
  if (keys.W.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.S.isDown) {
    velocityY = 1; // 向下
  }
  if (keys.A.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.D.isDown) {
    velocityX = 1; // 向右
  }
  
  // 如果同时按下多个键，归一化速度向量（保持恒定速度）
  if (velocityX !== 0 && velocityY !== 0) {
    const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= magnitude;
    velocityY /= magnitude;
  }
  
  // 更新六边形位置
  hexagon.x += velocityX * distance;
  hexagon.y += velocityY * distance;
  
  // 边界限制（可选，防止六边形移出屏幕）
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

new Phaser.Game(config);