const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 绘制10个随机位置的粉色菱形
  for (let i = 0; i < 10; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充 (FFC0CB 是粉色的十六进制值)
    graphics.fillStyle(0xFFC0CB, 1);
    
    // 定义菱形的4个顶点（大小为24像素）
    // 菱形中心在原点，向上下左右各延伸12像素
    const diamond = new Phaser.Geom.Polygon([
      0, -12,    // 顶部顶点
      12, 0,     // 右侧顶点
      0, 12,     // 底部顶点
      -12, 0     // 左侧顶点
    ]);
    
    // 填充菱形路径
    graphics.fillPoints(diamond.points, true);
    
    // 生成随机位置（留出边距，避免菱形超出画布）
    const randomX = Phaser.Math.Between(20, 780);
    const randomY = Phaser.Math.Between(20, 580);
    
    // 设置 Graphics 对象位置
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);