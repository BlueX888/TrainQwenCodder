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
  // 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('grayBox', 100, 100);
  graphics.destroy();

  // 创建蓝色方块纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x4a90e2, 1);
  graphicsBlue.fillRect(0, 0, 100, 100);
  graphicsBlue.generateTexture('blueBox', 100, 100);
  graphicsBlue.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的方块
  const box = this.add.sprite(initialX, initialY, 'grayBox');
  
  // 启用交互和拖拽
  box.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽灰色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 拖拽开始事件 - 改变颜色
  box.on('dragstart', (pointer) => {
    box.setTexture('blueBox');
    box.setScale(1.1); // 稍微放大表示被选中
  });

  // 拖拽中事件 - 更新位置
  box.on('drag', (pointer, dragX, dragY) => {
    box.x = dragX;
    box.y = dragY;
  });

  // 拖拽结束事件 - 恢复颜色和位置
  box.on('dragend', (pointer) => {
    box.setTexture('grayBox');
    box.setScale(1); // 恢复原始大小
    
    // 使用 tween 动画平滑回到初始位置
    this.tweens.add({
      targets: box,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  box.on('pointerover', () => {
    this.input.setDefaultCursor('pointer');
  });

  box.on('pointerout', () => {
    this.input.setDefaultCursor('default');
  });
}

new Phaser.Game(config);