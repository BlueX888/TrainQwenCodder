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
  
  // 创建黄色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色菱形
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('yellowDiamond', 100, 100);
  graphics.clear();
  
  // 创建红色菱形纹理（拖拽时使用）
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.beginPath();
  graphics.moveTo(50, 0);
  graphics.lineTo(100, 50);
  graphics.lineTo(50, 100);
  graphics.lineTo(0, 50);
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('redDiamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'yellowDiamond');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为红色
    gameObject.setTexture('redDiamond');
    // 可选：增加缩放效果
    gameObject.setScale(1.1);
  });
  
  // 监听拖拽事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新菱形位置跟随鼠标
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复黄色
    gameObject.setTexture('yellowDiamond');
    // 恢复缩放
    gameObject.setScale(1);
    
    // 使用补间动画回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽黄色菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);