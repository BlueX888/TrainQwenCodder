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
    // 创建 Graphics 对象用于绘制圆形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为紫色 (0x800080)
    graphics.fillStyle(0x800080, 1);
    
    // 在点击位置绘制半径为12像素的圆形（直径24像素）
    graphics.fillCircle(pointer.x, pointer.y, 12);
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Click anywhere to create purple circles', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);