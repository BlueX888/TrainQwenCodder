const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#ffffff'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建20个随机位置的蓝色三角形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置蓝色填充
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制等边三角形（顶点朝上）
    // 三角形大小为16像素，以中心为原点
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点（上）
      -size / 2, height / 2,    // 左下顶点
      size / 2, height / 2      // 右下顶点
    );
    
    // 设置随机位置（确保三角形完全在画布内）
    const x = Phaser.Math.Between(size, config.width - size);
    const y = Phaser.Math.Between(size, config.height - size);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);