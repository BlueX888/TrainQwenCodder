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
  // 创建黄色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(50, 50, 50);
  graphics.generateTexture('yellowCircle', 100, 100);
  graphics.destroy();

  // 创建红色圆形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.fillCircle(50, 50, 50);
  redGraphics.generateTexture('redCircle', 100, 100);
  redGraphics.destroy();
}

function create() {
  // 初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'yellowCircle');

  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽圆形试试！松手后会回到中心', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('redCircle');
  });

  // 监听拖拽事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新圆形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复黄色
    this.setTexture('yellowCircle');
    
    // 回到初始位置（添加缓动动画）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  circle.on('pointerover', function() {
    this.setScale(1.1);
  });

  circle.on('pointerout', function() {
    this.setScale(1.0);
  });
}

new Phaser.Game(config);