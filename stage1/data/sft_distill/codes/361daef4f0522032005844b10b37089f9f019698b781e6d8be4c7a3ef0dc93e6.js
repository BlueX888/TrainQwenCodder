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
let rectangle;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建灰色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('grayRect', 150, 100);
  graphics.destroy();

  // 创建蓝色矩形纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4a90e2, 1); // 蓝色
  blueGraphics.fillRect(0, 0, 150, 100);
  blueGraphics.generateTexture('blueRect', 150, 100);
  blueGraphics.destroy();

  // 创建矩形精灵
  rectangle = this.add.sprite(initialX, initialY, 'grayRect');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('blueRect');
  });

  // 监听拖拽中事件
  rectangle.on('drag', function(pointer, dragX, dragY) {
    // 更新矩形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  rectangle.on('dragend', function(pointer) {
    // 恢复灰色
    this.setTexture('grayRect');
    
    // 回到初始位置（使用补间动画使过渡更平滑）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽灰色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '松手后会自动回到中心位置', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);