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
  // 记录星形的初始位置
  const initialX = 400;
  const initialY = 300;

  // 使用 Graphics 绘制黄色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillStar(32, 32, 5, 16, 32, 0); // 5个角，内半径16，外半径32
  graphics.generateTexture('yellowStar', 64, 64);
  graphics.destroy();

  // 绘制红色星形纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1); // 红色
  graphicsRed.fillStar(32, 32, 5, 16, 32, 0);
  graphicsRed.generateTexture('redStar', 64, 64);
  graphicsRed.destroy();

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'yellowStar');

  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  star.on('dragstart', (pointer) => {
    // 改变为红色
    star.setTexture('redStar');
    // 增加缩放效果
    star.setScale(1.1);
  });

  // 监听拖拽中事件
  star.on('drag', (pointer, dragX, dragY) => {
    // 更新星形位置
    star.x = dragX;
    star.y = dragY;
  });

  // 监听拖拽结束事件
  star.on('dragend', (pointer) => {
    // 恢复黄色
    star.setTexture('yellowStar');
    // 恢复缩放
    star.setScale(1);
    
    // 使用补间动画回到初始位置
    this.tweens.add({
      targets: star,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  star.on('pointerover', () => {
    if (!this.input.dragState) {
      star.setScale(1.05);
    }
  });

  star.on('pointerout', () => {
    if (!this.input.dragState) {
      star.setScale(1);
    }
  });
}

new Phaser.Game(config);