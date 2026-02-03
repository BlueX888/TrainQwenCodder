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
  // 无需预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建黄色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillStar(64, 64, 5, 32, 64, 0);
  graphics.generateTexture('yellowStar', 128, 128);
  graphics.destroy();

  // 创建红色星形纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1);
  graphicsRed.fillStar(64, 64, 5, 32, 64, 0);
  graphicsRed.generateTexture('redStar', 128, 128);
  graphicsRed.destroy();

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'yellowStar');

  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });

  // 监听拖拽开始事件 - 改变为红色
  this.input.on('dragstart', (pointer, gameObject) => {
    if (gameObject === star) {
      star.setTexture('redStar');
      star.setScale(1.1); // 稍微放大增强视觉反馈
    }
  });

  // 监听拖拽过程 - 更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    if (gameObject === star) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    }
  });

  // 监听拖拽结束事件 - 恢复颜色和位置
  this.input.on('dragend', (pointer, gameObject) => {
    if (gameObject === star) {
      // 使用缓动动画回到初始位置
      this.tweens.add({
        targets: star,
        x: initialX,
        y: initialY,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      // 恢复黄色
      star.setTexture('yellowStar');
    }
  });

  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽星形试试看！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);