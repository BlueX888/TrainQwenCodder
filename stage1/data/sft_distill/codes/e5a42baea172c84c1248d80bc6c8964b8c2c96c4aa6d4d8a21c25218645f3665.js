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
    // 创建 Graphics 对象用于绘制椭圆
    const graphics = this.add.graphics();
    
    // 设置填充颜色为橙色 (RGB: 255, 165, 0)
    graphics.fillStyle(0xFFA500, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // x, y 是椭圆中心点坐标
    graphics.fillEllipse(pointer.x, pointer.y, 80, 80);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 30, '点击画布任意位置生成橙色椭圆', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);