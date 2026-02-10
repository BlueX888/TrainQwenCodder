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
  graphics.fillRect(0, 0, 120, 80);
  graphics.generateTexture('orangeRect', 120, 80);
  graphics.destroy();

  // 创建黄色矩形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillRect(0, 0, 120, 80);
  graphicsYellow.generateTexture('yellowRect', 120, 80);
  graphicsYellow.destroy();
}

function create() {
  // 初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'orangeRect');
  
  // 启用交互和拖拽
  rectangle.setInteractive({ draggable: true });

  // 添加提示文本
  const hint = this.add.text(400, 50, '拖拽橙色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  hint.setOrigin(0.5);

  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowRect');
  });

  // 监听拖拽中事件
  rectangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  rectangle.on('dragend', function(pointer) {
    // 恢复橙色
    this.setTexture('orangeRect');
    
    // 使用补间动画平滑返回初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
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