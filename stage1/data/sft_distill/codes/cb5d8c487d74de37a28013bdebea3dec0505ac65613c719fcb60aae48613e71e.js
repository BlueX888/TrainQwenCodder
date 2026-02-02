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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x3498db, 1); // 蓝色矩形
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('rectTexture', 150, 100);
  graphics.destroy();

  // 创建矩形精灵，放置在屏幕中心
  const rectangle = this.add.sprite(400, 300, 'rectTexture');
  
  // 设置为可交互并启用拖拽
  rectangle.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽矩形试试', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件 - 放大到 1.2 倍
  rectangle.on('dragstart', function(pointer, dragX, dragY) {
    this.setScale(1.2);
    this.setTint(0x2ecc71); // 拖拽时变绿色
  });

  // 监听拖拽中事件 - 更新位置
  rectangle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复原大小
  rectangle.on('dragend', function(pointer, dragX, dragY) {
    this.setScale(1.0);
    this.clearTint(); // 恢复原色
  });

  // 添加状态提示文本
  const statusText = this.add.text(400, 550, '状态: 待拖拽', {
    fontSize: '18px',
    color: '#cccccc'
  });
  statusText.setOrigin(0.5);

  // 更新状态文本
  rectangle.on('dragstart', () => {
    statusText.setText('状态: 拖拽中 (1.2倍)');
  });

  rectangle.on('dragend', () => {
    statusText.setText('状态: 已释放 (恢复原大小)');
  });
}

new Phaser.Game(config);