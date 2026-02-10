const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 注册点击事件监听器
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制圆形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为灰色 (0x808080)
    graphics.fillStyle(0x808080, 1);
    
    // 在点击位置绘制圆形
    // fillCircle(x, y, radius)
    // 48像素直径，半径为24
    graphics.fillCircle(pointer.x, pointer.y, 24);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a gray circle', {
    fontSize: '16px',
    color: '#000000'
  });
}

new Phaser.Game(config);