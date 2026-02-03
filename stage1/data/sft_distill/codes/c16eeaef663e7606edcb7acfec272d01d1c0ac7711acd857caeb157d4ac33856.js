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
  
  // 使用 Graphics 绘制蓝色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制蓝色菱形
  graphics.fillStyle(0x0088ff, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 顶点
  graphics.lineTo(100, 50);  // 右点
  graphics.lineTo(50, 100);  // 底点
  graphics.lineTo(0, 50);    // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成蓝色菱形纹理
  graphics.generateTexture('blueDiamond', 100, 100);
  graphics.clear();
  
  // 绘制红色菱形纹理（拖拽时使用）
  graphics.fillStyle(0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);
  graphics.lineTo(100, 50);
  graphics.lineTo(50, 100);
  graphics.lineTo(0, 50);
  graphics.closePath();
  graphics.fillPath();
  
  // 生成红色菱形纹理
  graphics.generateTexture('redDiamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'blueDiamond');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为红色
    gameObject.setTexture('redDiamond');
    // 提升层级
    gameObject.setDepth(1);
  });
  
  // 监听拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新位置跟随鼠标
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 改回蓝色
    gameObject.setTexture('blueDiamond');
    
    // 使用 Tween 动画回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
    
    // 恢复层级
    gameObject.setDepth(0);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);