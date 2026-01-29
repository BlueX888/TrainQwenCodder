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
  graphics.generateTexture('diamond-gray', 100, 100);
  graphics.destroy();
  
  // 创建亮色菱形纹理（拖拽时使用）
  const graphicsBright = this.add.graphics();
  graphicsBright.fillStyle(0x00ff00, 1);
  graphicsBright.beginPath();
  graphicsBright.moveTo(50, 0);
  graphicsBright.lineTo(100, 50);
  graphicsBright.lineTo(50, 100);
  graphicsBright.lineTo(0, 50);
  graphicsBright.closePath();
  graphicsBright.fillPath();
  graphicsBright.generateTexture('diamond-bright', 100, 100);
  graphicsBright.destroy();
}

function create() {
  // 创建菱形精灵
  const diamond = this.add.sprite(400, 300, 'diamond-gray');
  
  // 记录初始位置
  const initialX = diamond.x;
  const initialY = diamond.y;
  
  // 设置为可交互和可拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);
  
  // 监听拖拽开始事件
  diamond.on(Phaser.Input.Events.DRAG_START, (pointer, dragX, dragY) => {
    // 改变为亮色纹理
    diamond.setTexture('diamond-bright');
    // 可选：添加缩放效果
    diamond.setScale(1.1);
  });
  
  // 监听拖拽中事件
  diamond.on(Phaser.Input.Events.DRAG, (pointer, dragX, dragY) => {
    // 更新位置跟随鼠标
    diamond.x = dragX;
    diamond.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on(Phaser.Input.Events.DRAG_END, (pointer, dragX, dragY) => {
    // 恢复为灰色纹理
    diamond.setTexture('diamond-gray');
    // 恢复缩放
    diamond.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: diamond,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);