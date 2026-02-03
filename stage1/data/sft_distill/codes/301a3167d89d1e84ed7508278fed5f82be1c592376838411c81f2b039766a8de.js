const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建8个绿色三角形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制等边三角形，大小为16像素
    // 三角形顶点坐标（以中心为原点）
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height * 2/3,           // 顶点（上）
      -size / 2, height * 1/3,    // 左下顶点
      size / 2, height * 1/3      // 右下顶点
    );
    
    // 设置随机位置（确保三角形完全在画布内）
    const padding = size;
    const randomX = Phaser.Math.Between(padding, 800 - padding);
    const randomY = Phaser.Math.Between(padding, 600 - padding);
    
    graphics.setPosition(randomX, randomY);
  }
}

// 启动游戏
new Phaser.Game(config);