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
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4a90e2, 1);
  blueGraphics.fillRect(0, 0, 100, 100);
  blueGraphics.generateTexture('blueBox', 100, 100);
  blueGraphics.destroy();
}

function create() {
  // 初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的方块
  const box = this.add.sprite(initialX, initialY, 'grayBox');
  
  // 设置为可交互和可拖拽
  box.setInteractive({ draggable: true });

  // 添加拖拽开始事件 - 改变颜色
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTexture('blueBox');
  });

  // 添加拖拽中事件 - 更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // 添加拖拽结束事件 - 恢复颜色并回到初始位置
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setTexture('grayBox');
    
    // 使用 tween 动画平滑回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽灰色方块试试', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);