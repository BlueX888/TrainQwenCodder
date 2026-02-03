const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload,
    create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制椭圆
    const graphics = this.add.graphics();
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xffff00, 1);
    
    // 在点击位置绘制椭圆
    // fillEllipse(x, y, width, height)
    // x, y 是椭圆中心点坐标
    graphics.fillEllipse(pointer.x, pointer.y, 24, 24);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create yellow ellipses', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);