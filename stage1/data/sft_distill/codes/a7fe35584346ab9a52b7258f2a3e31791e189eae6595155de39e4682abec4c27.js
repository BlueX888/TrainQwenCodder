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

// 存储初始位置
let initialX = 400;
let initialY = 300;
let circle;

function preload() {
  // 创建黄色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(50, 50, 50);
  graphics.generateTexture('yellowCircle', 100, 100);
  graphics.destroy();

  // 创建红色圆形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.fillCircle(50, 50, 50);
  redGraphics.generateTexture('redCircle', 100, 100);
  redGraphics.destroy();
}

function create() {
  // 创建可拖拽的圆形精灵
  circle = this.add.sprite(initialX, initialY, 'yellowCircle');
  
  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 拖拽时改变为红色
    this.setTexture('redCircle');
  });
  
  // 监听拖拽中事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新圆形位置跟随指针
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复为黄色
    this.setTexture('yellowCircle');
    
    // 回到初始位置（添加缓动动画使其更平滑）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽黄色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);