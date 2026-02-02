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
    // 在点击位置创建80x80的绿色矩形
    // 使用 Graphics 绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色，不透明
    
    // 以点击位置为中心绘制矩形
    // fillRect 参数：x, y, width, height
    // 为了让矩形中心在点击位置，需要偏移 -40 像素
    graphics.fillRect(pointer.x - 40, pointer.y - 40, 80, 80);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a green square', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);