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
  // 使用 Graphics 生成红色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(50, 50, 50);
  graphics.generateTexture('redCircle', 100, 100);
  graphics.destroy();

  // 生成蓝色圆形纹理（拖拽时使用）
  const blueGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  blueGraphics.fillStyle(0x0000ff, 1);
  blueGraphics.fillCircle(50, 50, 50);
  blueGraphics.generateTexture('blueCircle', 100, 100);
  blueGraphics.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的圆形
  const circle = this.add.sprite(initialX, initialY, 'redCircle');
  
  // 启用交互和拖拽
  circle.setInteractive({ draggable: true });
  
  // 添加提示文本
  const hint = this.add.text(400, 50, '拖拽红色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('blueCircle');
    hint.setText('拖拽中...');
  });

  // 监听拖拽移动事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新圆形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复为红色
    this.setTexture('redCircle');
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    hint.setText('拖拽红色圆形试试！');
  });

  // 添加鼠标悬停效果
  circle.on('pointerover', function() {
    this.setScale(1.1);
  });

  circle.on('pointerout', function() {
    this.setScale(1);
  });
}

new Phaser.Game(config);