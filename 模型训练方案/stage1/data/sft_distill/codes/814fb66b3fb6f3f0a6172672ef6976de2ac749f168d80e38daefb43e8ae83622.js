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
  // 不需要加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 使用 Graphics 绘制红色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色，不透明
    
    // 在点击位置绘制 16x16 的矩形
    // 以点击点为中心，所以偏移 -8
    graphics.fillRect(pointer.x - 8, pointer.y - 8, 16, 16);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create red squares', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);