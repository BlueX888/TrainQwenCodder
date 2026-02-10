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
  // 记录椭圆的初始位置
  const initialX = 400;
  const initialY = 300;
  const ellipseWidth = 150;
  const ellipseHeight = 100;

  // 创建灰色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(ellipseWidth / 2, ellipseHeight / 2, ellipseWidth, ellipseHeight);
  graphics.generateTexture('grayEllipse', ellipseWidth, ellipseHeight);
  graphics.destroy();

  // 创建蓝色椭圆纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4a90e2, 1); // 蓝色
  blueGraphics.fillEllipse(ellipseWidth / 2, ellipseHeight / 2, ellipseWidth, ellipseHeight);
  blueGraphics.generateTexture('blueEllipse', ellipseWidth, ellipseHeight);
  blueGraphics.destroy();

  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'grayEllipse');

  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });

  // 添加提示文字
  const hintText = this.add.text(400, 50, '拖拽椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  hintText.setOrigin(0.5);

  // 监听拖拽开始事件
  ellipse.on('dragstart', (pointer) => {
    // 改变为蓝色
    ellipse.setTexture('blueEllipse');
    // 可选：增加一些视觉反馈，如放大
    ellipse.setScale(1.1);
  });

  // 监听拖拽过程事件
  ellipse.on('drag', (pointer, dragX, dragY) => {
    // 更新椭圆位置到鼠标位置
    ellipse.x = dragX;
    ellipse.y = dragY;
  });

  // 监听拖拽结束事件
  ellipse.on('dragend', (pointer) => {
    // 恢复为灰色
    ellipse.setTexture('grayEllipse');
    // 恢复原始大小
    ellipse.setScale(1);
    
    // 使用 tween 动画回到初始位置
    this.tweens.add({
      targets: ellipse,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加鼠标悬停效果
  ellipse.on('pointerover', () => {
    if (!this.input.activePointer.isDown) {
      ellipse.setAlpha(0.8);
    }
  });

  ellipse.on('pointerout', () => {
    ellipse.setAlpha(1);
  });
}

new Phaser.Game(config);