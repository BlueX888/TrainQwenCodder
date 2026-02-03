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
  // 创建青色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('cyanBox', 100, 100);
  graphics.destroy();

  // 创建黄色方块纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillRect(0, 0, 100, 100);
  graphicsYellow.generateTexture('yellowBox', 100, 100);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的方块
  const box = this.add.sprite(initialX, initialY, 'cyanBox');
  
  // 设置为可交互和可拖拽
  box.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  box.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowBox');
  });

  // 监听拖拽中事件
  box.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  box.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('cyanBox');
    
    // 添加回到初始位置的动画效果
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  box.on('pointerover', function() {
    this.setScale(1.1);
  });

  box.on('pointerout', function() {
    this.setScale(1.0);
  });
}

new Phaser.Game(config);