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
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  const radius = 50;

  // 创建绿色圆形纹理
  const graphicsGreen = this.add.graphics();
  graphicsGreen.fillStyle(0x00ff00, 1);
  graphicsGreen.fillCircle(radius, radius, radius);
  graphicsGreen.generateTexture('greenCircle', radius * 2, radius * 2);
  graphicsGreen.destroy();

  // 创建黄色圆形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillCircle(radius, radius, radius);
  graphicsYellow.generateTexture('yellowCircle', radius * 2, radius * 2);
  graphicsYellow.destroy();

  // 创建可拖拽的圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'greenCircle');
  
  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 添加提示文本
  const hintText = this.add.text(400, 100, '拖拽绿色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  hintText.setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 改变颜色为黄色
    this.setTexture('yellowCircle');
  });

  // 监听拖拽中事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复绿色
    this.setTexture('greenCircle');
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
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