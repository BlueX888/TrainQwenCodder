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

function preload() {
  // 创建橙色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1);
  graphics.fillRect(0, 0, 120, 80);
  graphics.generateTexture('orangeRect', 120, 80);
  graphics.destroy();

  // 创建黄色矩形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillRect(0, 0, 120, 80);
  graphicsYellow.generateTexture('yellowRect', 120, 80);
  graphicsYellow.destroy();
}

function create() {
  // 添加说明文字
  this.add.text(400, 50, '拖拽橙色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '松手后会自动回到初始位置', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 创建可拖拽的矩形
  const rectangle = this.add.sprite(initialX, initialY, 'orangeRect');

  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer) {
    // 拖拽时改变为黄色
    this.setTexture('yellowRect');
    // 可选：增加缩放效果
    this.setScale(1.1);
  });

  // 监听拖拽事件
  rectangle.on('drag', function(pointer, dragX, dragY) {
    // 更新矩形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  rectangle.on('dragend', function(pointer) {
    // 恢复橙色
    this.setTexture('orangeRect');
    // 恢复缩放
    this.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  rectangle.on('pointerover', function() {
    this.setAlpha(0.8);
  });

  rectangle.on('pointerout', function() {
    this.setAlpha(1);
  });
}

new Phaser.Game(config);