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
  // 不需要预加载资源
}

function create() {
  // 创建20个蓝色星形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置蓝色填充
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius)
    // 星形中心在 (0, 0)，外半径32像素（总大小64像素），内半径16像素
    graphics.fillStar(0, 0, 5, 16, 32);
    
    // 随机位置放置星形
    // 确保星形完全在画布内（留出32像素边距）
    graphics.setRandomPosition(32, 32, 800 - 64, 600 - 64);
  }
}

new Phaser.Game(config);