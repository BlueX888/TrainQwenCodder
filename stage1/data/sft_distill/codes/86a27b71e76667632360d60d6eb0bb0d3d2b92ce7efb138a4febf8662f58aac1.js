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
  // 不需要加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 使用 Graphics 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 100, 80);
  graphics.generateTexture('whiteRect', 100, 80);
  graphics.destroy();

  // 创建黄色矩形纹理（用于拖拽时）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillRect(0, 0, 100, 80);
  graphicsYellow.generateTexture('yellowRect', 100, 80);
  graphicsYellow.destroy();

  // 创建矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'whiteRect');

  // 设置为可交互并启用拖拽
  rectangle.setInteractive({ draggable: true });

  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖拽白色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  rectangle.on('dragstart', (pointer) => {
    // 改变为黄色
    rectangle.setTexture('yellowRect');
    hintText.setText('正在拖拽...');
  });

  // 监听拖拽过程事件
  rectangle.on('drag', (pointer, dragX, dragY) => {
    // 更新矩形位置
    rectangle.x = dragX;
    rectangle.y = dragY;
  });

  // 监听拖拽结束事件
  rectangle.on('dragend', (pointer) => {
    // 恢复白色
    rectangle.setTexture('whiteRect');
    
    // 回到初始位置（添加缓动动画效果更佳）
    this.tweens.add({
      targets: rectangle,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });

    hintText.setText('已回到初始位置！');
    
    // 2秒后恢复提示文本
    this.time.delayedCall(2000, () => {
      hintText.setText('拖拽白色矩形试试！');
    });
  });
}

new Phaser.Game(config);