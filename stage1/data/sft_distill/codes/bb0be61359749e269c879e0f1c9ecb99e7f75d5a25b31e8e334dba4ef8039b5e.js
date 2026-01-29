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
  // 无需预加载外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 创建灰色菱形纹理
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 底顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('diamondGray', 100, 100);
  
  // 创建高亮色菱形纹理（拖拽时使用）
  graphics.clear();
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);
  graphics.lineTo(100, 50);
  graphics.lineTo(50, 100);
  graphics.lineTo(0, 50);
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('diamondHighlight', 100, 100);
  
  // 销毁 graphics 对象
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(400, 300, 'diamondGray');
  
  // 记录初始位置
  const initialX = diamond.x;
  const initialY = diamond.y;
  
  // 设置为可交互和可拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);
  
  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为高亮颜色
    gameObject.setTexture('diamondHighlight');
  });
  
  // 监听拖拽事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新菱形位置
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复灰色
    gameObject.setTexture('diamondGray');
    
    // 回到初始位置（添加补间动画使效果更平滑）
    this.tweens.add({
      targets: gameObject,
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