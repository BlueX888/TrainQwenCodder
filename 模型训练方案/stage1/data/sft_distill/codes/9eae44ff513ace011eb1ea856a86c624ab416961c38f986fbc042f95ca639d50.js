const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形的顶点坐标（半径为 30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  graphics.fillPoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建六边形精灵并放置在屏幕中心
  this.hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置键盘输入（WASD）
  this.keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 移动速度（像素/秒）
  this.speed = 200;
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧应移动的距离
  const moveDistance = this.speed * deltaSeconds;
  
  // 根据按键状态更新位置
  if (this.keys.w.isDown) {
    this.hexagon.y -= moveDistance;
  }
  if (this.keys.s.isDown) {
    this.hexagon.y += moveDistance;
  }
  if (this.keys.a.isDown) {
    this.hexagon.x -= moveDistance;
  }
  if (this.keys.d.isDown) {
    this.hexagon.x += moveDistance;
  }
  
  // 边界限制（可选，防止六边形移出屏幕）
  this.hexagon.x = Phaser.Math.Clamp(this.hexagon.x, 0, 800);
  this.hexagon.y = Phaser.Math.Clamp(this.hexagon.y, 0, 600);
}

new Phaser.Game(config);