const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建紫色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1);
  graphics.fillEllipse(50, 40, 100, 80);
  graphics.generateTexture('ellipse_purple', 100, 80);
  graphics.destroy();

  // 创建亮紫色椭圆纹理（拖拽时使用）
  const graphicsDrag = this.add.graphics();
  graphicsDrag.fillStyle(0xcc99ff, 1);
  graphicsDrag.fillEllipse(50, 40, 100, 80);
  graphicsDrag.generateTexture('ellipse_light', 100, 80);
  graphicsDrag.destroy();
}

function create() {
  // 初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'ellipse_purple');

  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 拖拽开始事件 - 改变颜色
  ellipse.on('dragstart', (pointer) => {
    ellipse.setTexture('ellipse_light');
  });

  // 拖拽中事件 - 更新位置
  ellipse.on('drag', (pointer, dragX, dragY) => {
    ellipse.x = dragX;
    ellipse.y = dragY;
  });

  // 拖拽结束事件 - 恢复颜色和位置
  ellipse.on('dragend', (pointer) => {
    ellipse.setTexture('ellipse_purple');
    
    // 使用 tween 平滑回到初始位置
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