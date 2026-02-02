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
  graphics.fillStar(50, 50, 5, 20, 40);
  graphics.generateTexture('greenStar', 100, 100);
  graphics.destroy();

  // 创建黄色星形纹理
  const graphicsYellow = this.add.graphics();
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
  const star = this.add.sprite(initialX, initialY, 'greenStar');

  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  star.on('dragstart', () => {
    // 改变为黄色
    star.setTexture('yellowStar');
    // 增加缩放效果
    star.setScale(1.2);
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
    // 恢复原始缩放
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
}

new Phaser.Game(config);