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
  
  // 创建绿色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillStar(64, 64, 5, 32, 64, 0);
  graphics.generateTexture('greenStar', 128, 128);
  graphics.destroy();
  
  // 创建黄色星形纹理（用于拖拽时）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(64, 64, 5, 32, 64, 0);
  graphicsYellow.generateTexture('yellowStar', 128, 128);
  graphicsYellow.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'greenStar');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为黄色
    gameObject.setTexture('yellowStar');
    // 提升层级
    gameObject.setDepth(1);
  });
  
  // 监听拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新星形位置跟随鼠标
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 改回绿色
    gameObject.setTexture('greenStar');
    // 恢复层级
    gameObject.setDepth(0);
    
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: gameObject,
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