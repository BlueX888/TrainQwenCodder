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

// 记录初始位置
let initialX = 400;
let initialY = 300;
let circle;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy();

  // 创建蓝色圆形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x0088ff, 1);
  graphicsBlue.fillCircle(25, 25, 25);
  graphicsBlue.generateTexture('blueCircle', 50, 50);
  graphicsBlue.destroy();

  // 创建可拖拽的圆形精灵
  circle = this.add.sprite(initialX, initialY, 'orangeCircle');
  
  // 设置为可交互和可拖拽
  circle.setInteractive();
  this.input.setDraggable(circle);

  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 拖拽时改变颜色为蓝色
    gameObject.setTexture('blueCircle');
  });

  // 监听拖拽事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新圆形位置跟随鼠标
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复橙色
    gameObject.setTexture('orangeCircle');
    
    // 回到初始位置（添加缓动动画效果）
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽橙色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);