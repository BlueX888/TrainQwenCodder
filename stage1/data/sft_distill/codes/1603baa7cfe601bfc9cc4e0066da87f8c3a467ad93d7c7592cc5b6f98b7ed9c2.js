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
  
  // 创建红色菱形纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1);
  graphicsRed.beginPath();
  graphicsRed.moveTo(50, 0);
  graphicsRed.lineTo(100, 50);
  graphicsRed.lineTo(50, 100);
  graphicsRed.lineTo(0, 50);
  graphicsRed.closePath();
  graphicsRed.fillPath();
  graphicsRed.generateTexture('diamond-red', 100, 100);
  graphicsRed.destroy();
}

function create() {
  // 创建菱形精灵
  const diamond = this.add.sprite(400, 300, 'diamond-gray');
  
  // 保存初始位置
  const initialX = diamond.x;
  const initialY = diamond.y;
  
  // 设置为可交互和可拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);
  
  // 监听拖拽开始事件
  diamond.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('diamond-red');
  });
  
  // 监听拖拽过程事件
  diamond.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on('dragend', function(pointer) {
    // 恢复灰色
    this.setTexture('diamond-gray');
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);