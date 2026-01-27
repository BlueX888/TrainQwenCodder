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
  
  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  
  // 定义菱形的四个顶点（中心为原点）
  const diamondSize = 60;
  const points = [
    { x: 0, y: -diamondSize },      // 上
    { x: diamondSize, y: 0 },       // 右
    { x: 0, y: diamondSize },       // 下
    { x: -diamondSize, y: 0 }       // 左
  ];
  
  // 绘制灰色菱形
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成灰色菱形纹理
  graphics.generateTexture('diamondGray', diamondSize * 2, diamondSize * 2);
  graphics.clear();
  
  // 绘制蓝色菱形
  graphics.fillStyle(0x4a90e2, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成蓝色菱形纹理
  graphics.generateTexture('diamondBlue', diamondSize * 2, diamondSize * 2);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondGray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);
  
  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  hintText.setOrigin(0.5);
  
  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为蓝色
    gameObject.setTexture('diamondBlue');
    hintText.setText('拖拽中...');
  });
  
  // 监听拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新位置
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复灰色
    gameObject.setTexture('diamondGray');
    
    // 使用缓动动画回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    hintText.setText('拖拽菱形试试！');
  });
}

new Phaser.Game(config);