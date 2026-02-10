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
  // 使用 Graphics 程序化生成红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(50, 50, 50);
  graphics.generateTexture('redCircle', 100, 100);
  graphics.destroy();

  // 生成蓝色圆形纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x0000ff, 1);
  blueGraphics.fillCircle(50, 50, 50);
  blueGraphics.generateTexture('blueCircle', 100, 100);
  blueGraphics.destroy();
}

function create() {
  // 创建圆形精灵并设置初始位置
  const circle = this.add.sprite(400, 300, 'redCircle');
  
  // 保存初始位置
  const initialX = circle.x;
  const initialY = circle.y;

  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 拖拽时改变为蓝色
    this.setTexture('blueCircle');
  });

  // 监听拖拽中事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新圆形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复红色
    this.setTexture('redCircle');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽红色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);