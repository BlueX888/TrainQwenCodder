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
  const initialX = 400;
  const initialY = 300;
  
  // 使用 Graphics 绘制白色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillStar(50, 50, 5, 25, 50, 0);
  graphics.generateTexture('whiteStar', 100, 100);
  graphics.destroy();
  
  // 创建黄色星形纹理（用于拖拽时）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(50, 50, 5, 25, 50, 0);
  graphicsYellow.generateTexture('yellowStar', 100, 100);
  graphicsYellow.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'whiteStar');
  
  // 启用交互和拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 改变颜色
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTexture('yellowStar');
    // 可选：添加缩放效果
    gameObject.setScale(1.1);
  });
  
  // 监听拖拽事件 - 更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复颜色和位置
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复白色纹理
    gameObject.setTexture('whiteStar');
    // 恢复原始缩放
    gameObject.setScale(1);
    
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
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