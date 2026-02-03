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
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成粉色星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充样式
    graphics.fillStyle(0xff69b4, 1); // 粉色 (Hot Pink)
    
    // 绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius, angle)
    // 80像素指的是外径，所以外半径为40
    graphics.fillStar(
      pointer.x,        // x 坐标
      pointer.y,        // y 坐标
      5,                // 5个顶点
      20,               // 内半径
      40,               // 外半径（80像素直径）
      0                 // 旋转角度
    );
  });
}

new Phaser.Game(config);