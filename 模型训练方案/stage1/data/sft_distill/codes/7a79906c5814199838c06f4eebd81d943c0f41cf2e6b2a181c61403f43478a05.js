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
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillRect(0, 0, 120, 80);
  graphics.generateTexture('rectTexture', 120, 80);
  graphics.destroy();

  // 创建可拖拽的矩形 Sprite
  const rect = this.add.sprite(400, 300, 'rectTexture');
  
  // 设置为可交互并启用拖拽
  rect.setInteractive({ draggable: true });

  // 监听拖拽开始事件 - 放大到 1.2 倍
  rect.on('dragstart', (pointer, dragX, dragY) => {
    rect.setScale(1.2);
  });

  // 监听拖拽中事件 - 更新位置
  rect.on('drag', (pointer, dragX, dragY) => {
    rect.x = dragX;
    rect.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复原大小
  rect.on('dragend', (pointer, dragX, dragY) => {
    rect.setScale(1.0);
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);