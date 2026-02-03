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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x3498db, 1);
  graphics.fillRect(0, 0, 100, 80);
  
  // 生成纹理
  graphics.generateTexture('rectTexture', 100, 80);
  graphics.destroy();
  
  // 创建可拖拽的矩形 Sprite
  const rectangle = this.add.sprite(400, 300, 'rectTexture');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  rectangle.on('dragstart', function(pointer) {
    this.setScale(1.2);
  });
  
  // 监听拖拽中事件 - 更新位置
  rectangle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原始大小
  rectangle.on('dragend', function(pointer) {
    this.setScale(1.0);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);