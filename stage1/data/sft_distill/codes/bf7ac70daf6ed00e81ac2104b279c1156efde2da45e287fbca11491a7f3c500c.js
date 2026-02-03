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
  // 添加提示文本
  this.add.text(400, 50, '点击画布任意位置生成绿色椭圆', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // 16像素的椭圆，宽高都设为16
    graphics.fillEllipse(pointer.x, pointer.y, 16, 16);
  });
}

new Phaser.Game(config);