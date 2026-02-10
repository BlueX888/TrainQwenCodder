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

  // 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillCircle(radius, radius, radius);
  graphics.generateTexture('purpleCircle', radius * 2, radius * 2);
  graphics.destroy();

  // 创建黄色圆形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillCircle(radius, radius, radius);
  graphicsYellow.generateTexture('yellowCircle', radius * 2, radius * 2);
  graphicsYellow.destroy();

  // 创建圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'purpleCircle');

  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  circle.on('dragstart', (pointer) => {
    // 改变为黄色
    circle.setTexture('yellowCircle');
  });

  // 监听拖拽事件
  circle.on('drag', (pointer, dragX, dragY) => {
    // 更新圆形位置
    circle.x = dragX;
    circle.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', (pointer) => {
    // 恢复紫色
    circle.setTexture('purpleCircle');
    
    // 回到初始位置
    circle.x = initialX;
    circle.y = initialY;
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽紫色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);