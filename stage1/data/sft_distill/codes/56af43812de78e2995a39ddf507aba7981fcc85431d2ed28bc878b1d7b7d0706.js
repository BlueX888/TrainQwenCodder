const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建绿色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillStar(64, 64, 5, 32, 64, 0);
  graphics.generateTexture('greenStar', 128, 128);
  graphics.destroy();

  // 创建黄色星形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(64, 64, 5, 32, 64, 0);
  graphicsYellow.generateTexture('yellowStar', 128, 128);
  graphicsYellow.destroy();
}

function create() {
  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'greenStar');
  
  // 保存初始位置
  const initialX = star.x;
  const initialY = star.y;

  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });

  // 拖拽开始事件 - 改变颜色为黄色
  star.on('dragstart', (pointer) => {
    star.setTexture('yellowStar');
  });

  // 拖拽中事件 - 更新位置
  star.on('drag', (pointer, dragX, dragY) => {
    star.x = dragX;
    star.y = dragY;
  });

  // 拖拽结束事件 - 恢复颜色和位置
  star.on('dragend', (pointer) => {
    star.setTexture('greenStar');
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: star,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽绿色星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);