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
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充样式
    graphics.fillStyle(0xFFA500, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // 80像素椭圆，使用80作为宽度和高度
    graphics.fillEllipse(pointer.x, pointer.y, 80, 80);
  });
  
  // 添加提示文本
  this.add.text(10, 10, '点击画布任意位置生成橙色椭圆', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);