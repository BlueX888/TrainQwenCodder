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
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制星形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为蓝色
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制星形
    // fillStar(x, y, points, innerRadius, outerRadius, angle)
    // 64像素指外半径，内半径约为外半径的0.4倍
    graphics.fillStar(
      pointer.x,      // 点击位置 x
      pointer.y,      // 点击位置 y
      5,              // 5个尖角
      16,             // 内半径
      32,             // 外半径 (64/2 = 32，直径64像素)
      0               // 旋转角度
    );
  });
  
  // 添加提示文本
  this.add.text(400, 50, '点击画布任意位置生成蓝色星形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);