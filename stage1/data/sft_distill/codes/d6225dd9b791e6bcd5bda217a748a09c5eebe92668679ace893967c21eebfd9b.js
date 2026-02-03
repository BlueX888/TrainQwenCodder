const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制椭圆
    const graphics = this.add.graphics();
    
    // 设置橙色填充样式 (RGB: 255, 165, 0)
    graphics.fillStyle(0xFFA500, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // x, y 是椭圆中心点，width 和 height 是椭圆的宽度和高度
    graphics.fillEllipse(pointer.x, pointer.y, 64, 64);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create orange ellipses', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);