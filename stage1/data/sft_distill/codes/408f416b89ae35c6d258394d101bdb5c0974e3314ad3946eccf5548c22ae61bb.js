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
  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制椭圆
    const graphics = this.add.graphics();
    
    // 设置填充颜色为粉色 (0xFFC0CB)
    graphics.fillStyle(0xFFC0CB, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // 64像素的椭圆，宽高都为64
    graphics.fillEllipse(pointer.x, pointer.y, 64, 64);
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成粉色椭圆', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);