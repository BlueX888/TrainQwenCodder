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
  // 创建橙色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1);
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('orangeRect', 150, 100);
  graphics.destroy();

  // 创建红色矩形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.fillRect(0, 0, 150, 100);
  redGraphics.generateTexture('redRect', 150, 100);
  redGraphics.destroy();
}

function create() {
  // 初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'orangeRect');
  
  // 设置为可交互并启用拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽橙色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('redRect');
  });

  // 监听拖拽中事件
  rectangle.on('drag', function(pointer, dragX, dragY) {
    // 更新矩形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  rectangle.on('dragend', function(pointer) {
    // 恢复橙色
    this.setTexture('orangeRect');
    
    // 回到初始位置（添加缓动动画效果）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  rectangle.on('pointerover', function() {
    this.setScale(1.05);
  });

  rectangle.on('pointerout', function() {
    this.setScale(1);
  });
}

new Phaser.Game(config);