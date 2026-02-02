const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
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
    
    // 在点击位置绘制48x48的方块
    // 以点击点为中心，所以左上角坐标需要减去24（48的一半）
    graphics.fillRect(pointer.x - 24, pointer.y - 24, 48, 48);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create blue squares', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);