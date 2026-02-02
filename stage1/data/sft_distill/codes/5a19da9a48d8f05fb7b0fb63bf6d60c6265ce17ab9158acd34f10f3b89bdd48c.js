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
  
  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制灰色菱形
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('diamondGray', 100, 100);
  graphics.clear();
  
  // 创建蓝色菱形纹理（拖拽时使用）
  graphics.fillStyle(0x4a90e2, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);
  graphics.lineTo(100, 50);
  graphics.lineTo(50, 100);
  graphics.lineTo(0, 50);
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('diamondBlue', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondGray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);
  
  // 监听拖拽开始事件
  diamond.on(Phaser.Input.Events.DRAG_START, (pointer, dragX, dragY) => {
    // 拖拽时改变为蓝色
    diamond.setTexture('diamondBlue');
    // 提升层级
    diamond.setDepth(1);
  });
  
  // 监听拖拽中事件
  diamond.on(Phaser.Input.Events.DRAG, (pointer, dragX, dragY) => {
    // 更新位置跟随鼠标
    diamond.x = dragX;
    diamond.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on(Phaser.Input.Events.DRAG_END, (pointer, dragX, dragY) => {
    // 恢复灰色
    diamond.setTexture('diamondGray');
    // 恢复层级
    diamond.setDepth(0);
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: diamond,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽灰色菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);