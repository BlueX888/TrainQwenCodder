const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建红色星形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff0000, 1);
  graphics.fillStar(50, 50, 5, 40, 20);
  graphics.generateTexture('redStar', 100, 100);
  graphics.destroy();

  // 创建黄色星形纹理
  const graphicsYellow = this.make.graphics({ x: 0, y: 0, add: false });
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(50, 50, 5, 40, 20);
  graphicsYellow.generateTexture('yellowStar', 100, 100);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'redStar');

  // 启用交互和拖拽
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
    // 提高层级
    star.setDepth(1);
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
    // 恢复为红色
    star.setTexture('redStar');
    star.setDepth(0);
    text.setText('松手回到初始位置！');

    // 使用缓动动画回到初始位置
    this.tweens.add({
      targets: star,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        text.setText('拖拽星形试试！');
      }
    });
  });

  // 添加鼠标悬停效果
  star.on('pointerover', () => {
    star.setScale(1.1);
  });

  star.on('pointerout', () => {
    star.setScale(1.0);
  });
}

new Phaser.Game(config);