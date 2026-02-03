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

  // 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(radius, radius, radius);
  graphics.generateTexture('grayCircle', radius * 2, radius * 2);
  graphics.destroy();

  // 创建蓝色圆形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x4a90e2, 1); // 蓝色
  graphicsBlue.fillCircle(radius, radius, radius);
  graphicsBlue.generateTexture('blueCircle', radius * 2, radius * 2);
  graphicsBlue.destroy();

  // 创建圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'grayCircle');

  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('blueCircle');
  });

  // 监听拖拽事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新圆形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复灰色
    this.setTexture('grayCircle');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);