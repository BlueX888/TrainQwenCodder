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
  const ellipseWidth = 120;
  const ellipseHeight = 80;

  // 创建灰色椭圆纹理
  const grayGraphics = this.add.graphics();
  grayGraphics.fillStyle(0x808080, 1); // 灰色
  grayGraphics.fillEllipse(ellipseWidth / 2, ellipseHeight / 2, ellipseWidth, ellipseHeight);
  grayGraphics.generateTexture('ellipseGray', ellipseWidth, ellipseHeight);
  grayGraphics.destroy();

  // 创建蓝色椭圆纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4a90e2, 1); // 蓝色
  blueGraphics.fillEllipse(ellipseWidth / 2, ellipseHeight / 2, ellipseWidth, ellipseHeight);
  blueGraphics.generateTexture('ellipseBlue', ellipseWidth, ellipseHeight);
  blueGraphics.destroy();

  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'ellipseGray');

  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });

  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖拽椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  hintText.setOrigin(0.5);

  // 监听拖拽开始事件
  ellipse.on('dragstart', (pointer, dragX, dragY) => {
    // 改变为蓝色
    ellipse.setTexture('ellipseBlue');
  });

  // 监听拖拽事件
  ellipse.on('drag', (pointer, dragX, dragY) => {
    // 更新椭圆位置
    ellipse.x = dragX;
    ellipse.y = dragY;
  });

  // 监听拖拽结束事件
  ellipse.on('dragend', (pointer, dragX, dragY) => {
    // 恢复灰色
    ellipse.setTexture('ellipseGray');
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: ellipse,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  ellipse.on('pointerover', () => {
    ellipse.setScale(1.1);
  });

  ellipse.on('pointerout', () => {
    ellipse.setScale(1);
  });
}

new Phaser.Game(config);