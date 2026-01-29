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
  // 不需要预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建绿色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillStar(50, 50, 5, 20, 40);
  graphics.generateTexture('greenStar', 100, 100);
  graphics.destroy();
  
  // 创建黄色星形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(50, 50, 5, 20, 40);
  graphicsYellow.generateTexture('yellowStar', 100, 100);
  graphicsYellow.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'greenStar');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 改变颜色为黄色
  star.on('dragstart', (pointer) => {
    star.setTexture('yellowStar');
  });
  
  // 监听拖拽中事件 - 更新位置
  star.on('drag', (pointer, dragX, dragY) => {
    star.x = dragX;
    star.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复颜色并回到初始位置
  star.on('dragend', (pointer) => {
    star.setTexture('greenStar');
    
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: star,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);