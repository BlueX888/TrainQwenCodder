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

  // 创建白色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillStar(50, 50, 5, 20, 40);
  graphics.generateTexture('whiteStar', 100, 100);
  graphics.destroy();

  // 创建黄色星形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(50, 50, 5, 20, 40);
  graphicsYellow.generateTexture('yellowStar', 100, 100);
  graphicsYellow.destroy();

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'whiteStar');

  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });

  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  star.on('dragstart', (pointer) => {
    // 改变为黄色
    star.setTexture('yellowStar');
    star.setScale(1.1); // 稍微放大
    text.setText('拖拽中...');
  });

  // 监听拖拽事件
  star.on('drag', (pointer, dragX, dragY) => {
    // 更新星形位置
    star.x = dragX;
    star.y = dragY;
  });

  // 监听拖拽结束事件
  star.on('dragend', (pointer) => {
    // 恢复白色
    star.setTexture('whiteStar');
    star.setScale(1); // 恢复原始大小
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: star,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    text.setText('拖拽星形试试！');
  });

  // 添加鼠标悬停效果
  star.on('pointerover', () => {
    star.setScale(1.05);
  });

  star.on('pointerout', () => {
    // 只有在非拖拽状态下才恢复大小
    if (!this.input.dragState) {
      star.setScale(1);
    }
  });
}

new Phaser.Game(config);