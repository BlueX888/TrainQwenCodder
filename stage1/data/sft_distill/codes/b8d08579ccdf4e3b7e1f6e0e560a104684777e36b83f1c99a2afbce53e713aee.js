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
  // 记录菱形的初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  
  // 定义菱形的四个顶点（相对于中心点）
  const diamondPoints = [
    { x: 0, y: -50 },   // 上
    { x: 40, y: 0 },    // 右
    { x: 0, y: 50 },    // 下
    { x: -40, y: 0 }    // 左
  ];
  
  // 绘制灰色菱形
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(diamondPoints[0].x, diamondPoints[0].y);
  for (let i = 1; i < diamondPoints.length; i++) {
    graphics.lineTo(diamondPoints[i].x, diamondPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成灰色菱形纹理
  graphics.generateTexture('diamondGray', 100, 120);
  graphics.clear();
  
  // 绘制红色菱形
  graphics.fillStyle(0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(diamondPoints[0].x, diamondPoints[0].y);
  for (let i = 1; i < diamondPoints.length; i++) {
    graphics.lineTo(diamondPoints[i].x, diamondPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成红色菱形纹理
  graphics.generateTexture('diamondRed', 100, 120);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondGray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  diamond.on('dragstart', function(pointer) {
    // 拖拽时改变为红色
    this.setTexture('diamondRed');
  });
  
  // 监听拖拽事件
  diamond.on('drag', function(pointer, dragX, dragY) {
    // 更新菱形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on('dragend', function(pointer) {
    // 恢复灰色
    this.setTexture('diamondGray');
    
    // 回到初始位置（添加缓动效果）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽灰色菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);