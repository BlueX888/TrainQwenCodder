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
  // 创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('blueBox', 100, 100);
  graphics.destroy();

  // 创建红色方块纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.fillRect(0, 0, 100, 100);
  redGraphics.generateTexture('redBox', 100, 100);
  redGraphics.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的方块
  const box = this.add.sprite(initialX, initialY, 'blueBox');
  
  // 设置为可交互并启用拖拽
  box.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽蓝色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  box.on('dragstart', function(pointer) {
    // 拖拽时变为红色
    this.setTexture('redBox');
  });

  // 监听拖拽事件
  box.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  box.on('dragend', function(pointer) {
    // 恢复蓝色
    this.setTexture('blueBox');
    
    // 使用 tween 动画回到初始位置
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