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

  // 创建黄色星形纹理
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(64, 64, 5, 32, 64, 0);
  graphicsYellow.generateTexture('yellowStar', 128, 128);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'greenStar');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });

  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  star.on('dragstart', () => {
    // 拖拽时改变为黄色
    star.setTexture('yellowStar');
    star.setScale(1.1); // 稍微放大一点
  });

  // 监听拖拽事件
  star.on('drag', (pointer, dragX, dragY) => {
    // 更新星形位置
    star.x = dragX;
    star.y = dragY;
  });

  // 监听拖拽结束事件
  star.on('dragend', () => {
    // 恢复绿色
    star.setTexture('greenStar');
    star.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: star,
      x: initialX,
      y: initialY,
      duration: 500,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  star.on('pointerover', () => {
    if (!star.input.isDragging) {
      star.setScale(1.05);
    }
  });

  star.on('pointerout', () => {
    if (!star.input.isDragging) {
      star.setScale(1);
    }
  });
}

new Phaser.Game(config);