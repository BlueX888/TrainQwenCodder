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
  
  // 创建黄色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('yellowDiamond', 64, 64);
  graphics.destroy();
  
  // 创建红色菱形纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1); // 红色
  graphicsRed.beginPath();
  graphicsRed.moveTo(32, 0);
  graphicsRed.lineTo(64, 32);
  graphicsRed.lineTo(32, 64);
  graphicsRed.lineTo(0, 32);
  graphicsRed.closePath();
  graphicsRed.fillPath();
  graphicsRed.generateTexture('redDiamond', 64, 64);
  graphicsRed.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'yellowDiamond');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为红色
    gameObject.setTexture('redDiamond');
  });
  
  // 监听拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新菱形位置
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复黄色
    gameObject.setTexture('yellowDiamond');
    
    // 回到初始位置（添加缓动动画效果）
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽黄色菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);