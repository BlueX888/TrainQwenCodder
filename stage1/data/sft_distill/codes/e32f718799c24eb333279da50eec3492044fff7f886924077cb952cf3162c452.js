const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
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
    
    // 设置填充颜色为灰色
    graphics.fillStyle(0x808080, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // 椭圆中心在点击位置，直径为16像素
    graphics.fillEllipse(pointer.x, pointer.y, 16, 16);
  });
}

new Phaser.Game(config);