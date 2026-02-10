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
  // 创建蓝色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制蓝色菱形
  graphics.fillStyle(0x0088ff, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 底顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('blueDiamond', 100, 100);
  graphics.destroy();
  
  // 创建红色菱形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff4444, 1);
  redGraphics.beginPath();
  redGraphics.moveTo(50, 0);
  redGraphics.lineTo(100, 50);
  redGraphics.lineTo(50, 100);
  redGraphics.lineTo(0, 50);
  redGraphics.closePath();
  redGraphics.fillPath();
  redGraphics.generateTexture('redDiamond', 100, 100);
  redGraphics.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'blueDiamond');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听拖拽开始事件
  diamond.on(Phaser.Input.Events.DRAG_START, (pointer, dragX, dragY) => {
    // 改变为红色
    diamond.setTexture('redDiamond');
    // 提升层级
    diamond.setDepth(1);
    hintText.setText('拖拽中...');
  });
  
  // 监听拖拽中事件
  diamond.on(Phaser.Input.Events.DRAG, (pointer, dragX, dragY) => {
    // 更新位置
    diamond.x = dragX;
    diamond.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on(Phaser.Input.Events.DRAG_END, (pointer, dragX, dragY) => {
    // 恢复蓝色
    diamond.setTexture('blueDiamond');
    
    // 使用补间动画回到初始位置
    this.tweens.add({
      targets: diamond,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    hintText.setText('已回到初始位置');
    
    // 2秒后恢复提示文本
    this.time.delayedCall(2000, () => {
      hintText.setText('拖拽菱形试试！');
    });
  });
}

new Phaser.Game(config);