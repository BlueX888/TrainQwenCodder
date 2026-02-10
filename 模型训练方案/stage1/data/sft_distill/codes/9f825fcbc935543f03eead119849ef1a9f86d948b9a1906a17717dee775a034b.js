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
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('box', 100, 100);
  graphics.destroy();

  // 创建方块 Sprite
  const box = this.add.sprite(400, 300, 'box');
  box.setOrigin(0.5, 0.5);

  // 设置为可交互并启用拖拽
  box.setInteractive({ draggable: true });

  // 监听拖拽开始事件 - 放大到 1.2 倍
  box.on('dragstart', (pointer, dragX, dragY) => {
    box.setScale(1.2);
  });

  // 监听拖拽中事件 - 更新位置
  box.on('drag', (pointer, dragX, dragY) => {
    box.x = dragX;
    box.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复原大小
  box.on('dragend', (pointer, dragX, dragY) => {
    box.setScale(1.0);
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);