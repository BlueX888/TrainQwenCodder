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
    
    // 设置填充颜色为青色 (cyan)
    graphics.fillStyle(0x00ffff, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // 椭圆中心在点击位置，宽高都是64像素
    graphics.fillEllipse(pointer.x, pointer.y, 64, 64);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create cyan ellipses', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);