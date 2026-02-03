const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建3个橙色椭圆
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const ellipse = this.add.graphics();
    
    // 设置橙色填充（0xFFA500 是橙色的十六进制值）
    ellipse.fillStyle(0xFFA500, 1);
    
    // 绘制椭圆，中心点在(0, 0)，宽高各64像素（半径32）
    ellipse.fillEllipse(0, 0, 64, 64);
    
    // 设置随机位置（考虑椭圆大小，避免超出边界）
    const randomX = Phaser.Math.Between(32, 800 - 32);
    const randomY = Phaser.Math.Between(32, 600 - 32);
    ellipse.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);