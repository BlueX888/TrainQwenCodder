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
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制椭圆
    const graphics = this.add.graphics();
    
    // 设置填充颜色为橙色
    graphics.fillStyle(0xFFA500, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // 椭圆直径为 80 像素，所以宽高都是 80
    graphics.fillEllipse(pointer.x, pointer.y, 80, 80);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create an orange ellipse', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);