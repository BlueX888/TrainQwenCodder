const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建20个随机位置的黄色菱形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制菱形（32像素大小）
    // 菱形中心在 (0, 0)，四个顶点分别在上下左右
    const size = 32;
    const halfSize = size / 2;
    
    graphics.beginPath();
    graphics.moveTo(0, -halfSize);      // 上顶点
    graphics.lineTo(halfSize, 0);       // 右顶点
    graphics.lineTo(0, halfSize);       // 下顶点
    graphics.lineTo(-halfSize, 0);      // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（确保菱形完全在画布内）
    const x = Phaser.Math.Between(halfSize, 800 - halfSize);
    const y = Phaser.Math.Between(halfSize, 600 - halfSize);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);