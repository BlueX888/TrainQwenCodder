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
    
    // 设置粉色填充样式 (RGB: 255, 192, 203)
    graphics.fillStyle(0xffc0cb, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // x, y 为椭圆中心坐标
    // width, height 为椭圆的宽度和高度
    graphics.fillEllipse(pointer.x, pointer.y, 64, 64);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create pink ellipses', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);