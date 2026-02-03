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
  // 循环创建20个粉色椭圆
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充样式 (RGB: 255, 192, 203)
    graphics.fillStyle(0xffc0cb, 1);
    
    // 绘制椭圆：中心点(0, 0)，水平半径32，垂直半径32
    // 这样创建的椭圆总大小为 64x64 像素
    graphics.fillEllipse(0, 0, 64, 64);
    
    // 设置随机位置
    // x: 32 到 768 之间（确保椭圆完全在画布内）
    // y: 32 到 568 之间
    graphics.setRandomPosition(32, 32, 736, 536);
  }
}

new Phaser.Game(config);