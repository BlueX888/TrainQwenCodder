const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#ffffff'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制矩形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为灰色 (0x808080)
    graphics.fillStyle(0x808080, 1);
    
    // 在点击位置绘制 24x24 的矩形
    // 矩形中心对齐点击位置，所以偏移 -12
    graphics.fillRect(pointer.x - 12, pointer.y - 12, 24, 24);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a gray square', {
    fontSize: '16px',
    color: '#000000'
  });
}

new Phaser.Game(config);