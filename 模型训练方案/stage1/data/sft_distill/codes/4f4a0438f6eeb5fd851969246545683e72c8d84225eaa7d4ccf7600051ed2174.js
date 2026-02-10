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

  // 创建绿色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(0, -40);  // 顶点
  graphics.lineTo(-35, 40);  // 左下角
  graphics.lineTo(35, 40);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('greenTriangle', 70, 80);
  graphics.destroy();

  // 创建黄色三角形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.beginPath();
  graphicsYellow.moveTo(0, -40);
  graphicsYellow.lineTo(-35, 40);
  graphicsYellow.lineTo(35, 40);
  graphicsYellow.closePath();
  graphicsYellow.fillPath();
  graphicsYellow.generateTexture('yellowTriangle', 70, 80);
  graphicsYellow.destroy();

  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'greenTriangle');

  // 启用交互和拖拽
  triangle.setInteractive({ draggable: true });

  // 添加提示文本
  const instructionText = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  instructionText.setOrigin(0.5);

  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowTriangle');
    // 增加缩放效果
    this.setScale(1.1);
  });

  // 监听拖拽事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复绿色
    this.setTexture('greenTriangle');
    // 恢复缩放
    this.setScale(1);
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  triangle.on('pointerover', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1.05);
    }
  });

  triangle.on('pointerout', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1);
    }
  });
}

new Phaser.Game(config);