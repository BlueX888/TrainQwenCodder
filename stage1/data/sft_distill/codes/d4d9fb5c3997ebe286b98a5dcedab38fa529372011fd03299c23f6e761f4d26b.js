const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建青色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillEllipse(50, 40, 100, 80); // 中心点(50,40)，宽100，高80
  graphics.generateTexture('cyanEllipse', 100, 80);
  graphics.destroy();

  // 创建黄色椭圆纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillEllipse(50, 40, 100, 80);
  graphicsYellow.generateTexture('yellowEllipse', 100, 80);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'cyanEllipse');

  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 拖拽开始事件 - 改变颜色为黄色
  ellipse.on('dragstart', (pointer) => {
    ellipse.setTexture('yellowEllipse');
    ellipse.setScale(1.1); // 稍微放大一点作为视觉反馈
  });

  // 拖拽中事件 - 更新位置
  ellipse.on('drag', (pointer, dragX, dragY) => {
    ellipse.x = dragX;
    ellipse.y = dragY;
  });

  // 拖拽结束事件 - 恢复颜色并回到初始位置
  ellipse.on('dragend', (pointer) => {
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: ellipse,
      x: initialX,
      y: initialY,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 动画完成后恢复青色
        ellipse.setTexture('cyanEllipse');
      }
    });
  });

  // 添加鼠标悬停效果
  ellipse.on('pointerover', () => {
    if (!ellipse.input.isDragging) {
      this.input.setDefaultCursor('pointer');
    }
  });

  ellipse.on('pointerout', () => {
    this.input.setDefaultCursor('default');
  });
}

new Phaser.Game(config);