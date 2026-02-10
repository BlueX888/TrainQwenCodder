const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 8 个红色菱形
  for (let i = 0; i < 8; i++) {
    const graphics = this.add.graphics();
    
    // 设置红色填充
    graphics.fillStyle(0xff0000, 1);
    
    // 绘制菱形（16像素大小，即从中心点到边缘8像素）
    graphics.beginPath();
    graphics.moveTo(0, -8);    // 上顶点
    graphics.lineTo(8, 0);     // 右顶点
    graphics.lineTo(0, 8);     // 下顶点
    graphics.lineTo(-8, 0);    // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（留出边距避免菱形超出画布）
    const x = Phaser.Math.Between(20, 780);
    const y = Phaser.Math.Between(20, 580);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);