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
  // 无需预加载资源
}

function create() {
  // 循环创建20个黄色三角形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制等边三角形
    // 三角形顶点坐标（以中心为原点，边长24像素）
    const size = 24;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    // 三个顶点坐标（相对于中心）
    const x1 = 0;
    const y1 = -height * 2 / 3; // 顶点
    const x2 = -size / 2;
    const y2 = height / 3; // 左下角
    const x3 = size / 2;
    const y3 = height / 3; // 右下角
    
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    // 设置随机位置（考虑三角形大小，避免超出边界）
    const margin = 20;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);