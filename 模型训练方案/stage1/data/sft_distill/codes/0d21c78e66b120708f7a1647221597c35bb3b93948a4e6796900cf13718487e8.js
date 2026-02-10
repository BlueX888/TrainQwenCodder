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
    // 创建 Graphics 对象用于绘制方块
    const graphics = this.add.graphics();
    
    // 设置填充颜色为蓝色
    graphics.fillStyle(0x0000ff, 1);
    
    // 在点击位置绘制16x16的方块
    // 让方块中心对齐点击位置，所以偏移-8像素
    graphics.fillRect(pointer.x - 8, pointer.y - 8, 16, 16);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create blue squares', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);