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
  const radius = 50;

  // 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(radius, radius, radius);
  graphics.generateTexture('greenCircle', radius * 2, radius * 2);
  graphics.destroy();

  // 创建黄色圆形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillCircle(radius, radius, radius);
  graphicsYellow.generateTexture('yellowCircle', radius * 2, radius * 2);
  graphicsYellow.destroy();

  // 创建可拖拽的圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'greenCircle');
  
  // 设置为可交互并启用拖拽
  circle.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowCircle');
  });

  // 监听拖拽事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新圆形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复绿色
    this.setTexture('greenCircle');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });

  // 添加提示文字
  this.add.text(400, 50, '拖拽绿色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);