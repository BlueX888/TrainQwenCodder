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
  // 创建六边形纹理
  const graphics = this.add.graphics();
  const hexRadius = 30;
  const hexSides = 6;
  
  // 绘制橙色六边形
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.lineStyle(2, 0xFFFFFF, 1); // 白色边框
  
  // 计算六边形顶点
  graphics.beginPath();
  for (let i = 0; i < hexSides; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = hexRadius + Math.cos(angle) * hexRadius;
    const y = hexRadius + Math.sin(angle) * hexRadius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在画布中心
  this.hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建方向键控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 存储移动速度
  this.moveSpeed = 200;
  
  // 存储六边形半径用于边界检测
  this.hexRadius = hexRadius;
}

function update(time, delta) {
  // 计算每帧移动距离
  const distance = this.moveSpeed * (delta / 1000);
  
  // 根据方向键更新位置
  if (this.cursors.left.isDown) {
    this.hexagon.x -= distance;
  }
  if (this.cursors.right.isDown) {
    this.hexagon.x += distance;
  }
  if (this.cursors.up.isDown) {
    this.hexagon.y -= distance;
  }
  if (this.cursors.down.isDown) {
    this.hexagon.y += distance;
  }
  
  // 限制在画布边界内
  this.hexagon.x = Phaser.Math.Clamp(
    this.hexagon.x,
    this.hexRadius,
    config.width - this.hexRadius
  );
  this.hexagon.y = Phaser.Math.Clamp(
    this.hexagon.y,
    this.hexRadius,
    config.height - this.hexRadius
  );
}

new Phaser.Game(config);