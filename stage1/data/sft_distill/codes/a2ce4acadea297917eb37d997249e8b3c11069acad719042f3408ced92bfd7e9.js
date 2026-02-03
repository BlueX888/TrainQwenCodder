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
  // 记录星形初始位置
  const startX = 400;
  const startY = 300;
  
  // 创建红色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillStar(64, 64, 5, 32, 64, 0);
  graphics.generateTexture('redStar', 128, 128);
  graphics.destroy();
  
  // 创建黄色星形纹理（用于拖拽时）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(64, 64, 5, 32, 64, 0);
  graphicsYellow.generateTexture('yellowStar', 128, 128);
  graphicsYellow.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(startX, startY, 'redStar');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 改变颜色为黄色
  star.on('dragstart', (pointer, dragX, dragY) => {
    star.setTexture('yellowStar');
  });
  
  // 监听拖拽中事件 - 更新星形位置
  star.on('drag', (pointer, dragX, dragY) => {
    star.x = dragX;
    star.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复红色并回到初始位置
  star.on('dragend', (pointer, dragX, dragY) => {
    star.setTexture('redStar');
    // 使用补间动画平滑返回初始位置
    this.tweens.add({
      targets: star,
      x: startX,
      y: startY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);