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
  // 监听画布上的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充样式为紫色
    graphics.fillStyle(0x9933ff, 1);
    
    // 在点击位置绘制圆形（半径40像素，直径80像素）
    graphics.fillCircle(pointer.x, pointer.y, 40);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create purple circles', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);