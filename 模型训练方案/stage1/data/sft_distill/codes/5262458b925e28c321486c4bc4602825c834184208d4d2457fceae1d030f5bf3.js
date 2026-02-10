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
  // 创建蓝色星形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillStar(50, 50, 5, 20, 40);
  graphics.generateTexture('blueStar', 100, 100);
  graphics.destroy();

  // 创建黄色星形纹理
  const graphicsYellow = this.make.graphics({ x: 0, y: 0, add: false });
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(50, 50, 5, 20, 40);
  graphicsYellow.generateTexture('yellowStar', 100, 100);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'blueStar');

  // 设置为可交互并启用拖拽
  star.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件 - 改变颜色为黄色
  star.on('dragstart', (pointer) => {
    star.setTexture('yellowStar');
    text.setText('拖拽中...');
  });

  // 监听拖拽事件 - 更新位置
  star.on('drag', (pointer, dragX, dragY) => {
    star.x = dragX;
    star.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复蓝色并回到初始位置
  star.on('dragend', (pointer) => {
    star.setTexture('blueStar');
    
    // 使用补间动画平滑回到初始位置
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
    star.setScale(1.1);
  });

  star.on('pointerout', () => {
    star.setScale(1);
  });
}

new Phaser.Game(config);