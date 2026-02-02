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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x3498db, 1);
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('rectTexture', 150, 100);
  graphics.destroy();

  // 创建矩形 Sprite
  const rectangle = this.add.sprite(400, 300, 'rectTexture');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 添加拖拽开始事件 - 放大到 1.2 倍
  rectangle.on('dragstart', function(pointer, dragX, dragY) {
    this.setScale(1.2);
  });
  
  // 添加拖拽事件 - 更新位置
  rectangle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 添加拖拽结束事件 - 恢复原始大小
  rectangle.on('dragend', function(pointer, dragX, dragY) {
    this.setScale(1);
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);