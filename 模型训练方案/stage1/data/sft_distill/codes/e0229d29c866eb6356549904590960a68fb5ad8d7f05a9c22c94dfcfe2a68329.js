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
  const radius = 50;

  // 创建粉色圆形纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillCircle(radius, radius, radius);
  pinkGraphics.generateTexture('pinkCircle', radius * 2, radius * 2);
  pinkGraphics.destroy();

  // 创建黄色圆形纹理（拖拽时使用）
  const yellowGraphics = this.add.graphics();
  yellowGraphics.fillStyle(0xffff00, 1); // 黄色
  yellowGraphics.fillCircle(radius, radius, radius);
  yellowGraphics.generateTexture('yellowCircle', radius * 2, radius * 2);
  yellowGraphics.destroy();

  // 创建圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'pinkCircle');

  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖拽粉色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  hintText.setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowCircle');
    // 可选：添加缩放效果
    this.setScale(1.1);
  });

  // 监听拖拽事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新圆形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复粉色
    this.setTexture('pinkCircle');
    // 恢复原始缩放
    this.setScale(1);
    
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
  circle.on('pointerover', function() {
    this.scene.input.setDefaultCursor('pointer');
  });

  circle.on('pointerout', function() {
    this.scene.input.setDefaultCursor('default');
  });
}

new Phaser.Game(config);