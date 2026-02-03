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

// 记录椭圆的初始位置
let initialX = 400;
let initialY = 300;
let ellipse;

function preload() {
  // 创建灰色椭圆纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x808080, 1);
  graphics.fillEllipse(60, 40, 120, 80);
  graphics.generateTexture('ellipseGray', 120, 80);
  graphics.destroy();

  // 创建绿色椭圆纹理（拖拽时使用）
  const graphicsGreen = this.make.graphics({ x: 0, y: 0, add: false });
  graphicsGreen.fillStyle(0x00ff00, 1);
  graphicsGreen.fillEllipse(60, 40, 120, 80);
  graphicsGreen.generateTexture('ellipseGreen', 120, 80);
  graphicsGreen.destroy();
}

function create() {
  // 添加提示文字
  this.add.text(400, 50, 'Drag the ellipse!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建椭圆精灵
  ellipse = this.add.sprite(initialX, initialY, 'ellipseGray');

  // 启用交互和拖拽
  ellipse.setInteractive({ draggable: true });

  // 监听拖拽开始事件 - 改变颜色
  ellipse.on('dragstart', function(pointer) {
    this.setTexture('ellipseGreen');
    this.setScale(1.1); // 稍微放大一点增强视觉反馈
  });

  // 监听拖拽事件 - 更新位置
  ellipse.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复颜色和位置
  ellipse.on('dragend', function(pointer) {
    this.setTexture('ellipseGray');
    this.setScale(1); // 恢复原始大小
    
    // 使用补间动画平滑回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  ellipse.on('pointerover', function() {
    if (!this.scene.input.activePointer.isDown) {
      this.setAlpha(0.8);
    }
  });

  ellipse.on('pointerout', function() {
    this.setAlpha(1);
  });
}

new Phaser.Game(config);