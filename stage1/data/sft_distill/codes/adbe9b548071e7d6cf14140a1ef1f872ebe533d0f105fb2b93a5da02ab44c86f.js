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
  
  // 创建紫色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制紫色菱形
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建拖拽时的亮紫色菱形纹理
  const graphicsDrag = this.add.graphics();
  graphicsDrag.fillStyle(0xd896ff, 1); // 亮紫色
  graphicsDrag.beginPath();
  graphicsDrag.moveTo(50, 0);
  graphicsDrag.lineTo(100, 50);
  graphicsDrag.lineTo(50, 100);
  graphicsDrag.lineTo(0, 50);
  graphicsDrag.closePath();
  graphicsDrag.fillPath();
  graphicsDrag.generateTexture('diamondDrag', 100, 100);
  graphicsDrag.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamond');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听拖拽开始事件
  this.input.on(Phaser.Input.Events.DRAG_START, (pointer, gameObject) => {
    // 改变为亮紫色
    gameObject.setTexture('diamondDrag');
    // 增加缩放效果
    gameObject.setScale(1.1);
    text.setText('拖拽中...');
  });
  
  // 监听拖拽事件
  this.input.on(Phaser.Input.Events.DRAG, (pointer, gameObject, dragX, dragY) => {
    // 更新位置跟随鼠标
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on(Phaser.Input.Events.DRAG_END, (pointer, gameObject) => {
    // 恢复原始紫色
    gameObject.setTexture('diamond');
    // 恢复缩放
    gameObject.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    text.setText('拖拽菱形试试！');
  });
  
  // 添加鼠标悬停效果
  diamond.on('pointerover', () => {
    if (!this.input.dragState) {
      diamond.setScale(1.05);
    }
  });
  
  diamond.on('pointerout', () => {
    if (!this.input.dragState) {
      diamond.setScale(1);
    }
  });
}

new Phaser.Game(config);