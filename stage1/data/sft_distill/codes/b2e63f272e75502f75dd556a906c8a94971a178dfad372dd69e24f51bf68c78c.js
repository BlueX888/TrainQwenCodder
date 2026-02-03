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
  // 创建蓝色菱形纹理
  const graphics = this.add.graphics();
  
  // 定义菱形的四个顶点（中心为原点）
  const diamondPoints = [
    { x: 0, y: -50 },   // 上
    { x: 40, y: 0 },    // 右
    { x: 0, y: 50 },    // 下
    { x: -40, y: 0 }    // 左
  ];
  
  // 绘制蓝色菱形
  graphics.fillStyle(0x4a90e2, 1);
  graphics.beginPath();
  graphics.moveTo(diamondPoints[0].x, diamondPoints[0].y);
  for (let i = 1; i < diamondPoints.length; i++) {
    graphics.lineTo(diamondPoints[i].x, diamondPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成蓝色菱形纹理
  graphics.generateTexture('blueDiamond', 80, 100);
  graphics.clear();
  
  // 绘制红色菱形纹理（拖拽时使用）
  graphics.fillStyle(0xe74c3c, 1);
  graphics.beginPath();
  graphics.moveTo(diamondPoints[0].x, diamondPoints[0].y);
  for (let i = 1; i < diamondPoints.length; i++) {
    graphics.lineTo(diamondPoints[i].x, diamondPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成红色菱形纹理
  graphics.generateTexture('redDiamond', 80, 100);
  graphics.destroy();
  
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'blueDiamond');
  
  // 启用拖拽交互
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  diamond.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('redDiamond');
  });
  
  // 监听拖拽事件
  diamond.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on('dragend', function(pointer) {
    // 恢复蓝色
    this.setTexture('blueDiamond');
    
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
  const text = this.add.text(400, 50, '拖动菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);