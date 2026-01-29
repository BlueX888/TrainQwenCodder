const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  
  // 绘制菱形（四个顶点）
  const points = [
    { x: 50, y: 0 },   // 上
    { x: 100, y: 50 }, // 右
    { x: 50, y: 100 }, // 下
    { x: 0, y: 50 }    // 左
  ];
  graphics.fillPoints(points, true);
  graphics.generateTexture('diamondGray', 100, 100);
  graphics.destroy();
  
  // 创建红色菱形纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1);
  graphicsRed.fillPoints(points, true);
  graphicsRed.generateTexture('diamondRed', 100, 100);
  graphicsRed.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondGray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);
  
  // 拖拽开始事件：改变颜色为红色
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTexture('diamondRed');
  });
  
  // 拖拽中事件：更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 拖拽结束事件：恢复灰色并回到初始位置
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setTexture('diamondGray');
    
    // 添加缓动动画回到初始位置
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