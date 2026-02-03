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
  // 记录星形的初始位置
  const initialX = 400;
  const initialY = 300;

  // 使用 Graphics 创建红色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillStar(64, 64, 5, 32, 64, 0);
  graphics.generateTexture('redStar', 128, 128);
  graphics.destroy();

  // 使用 Graphics 创建黄色星形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(64, 64, 5, 32, 64, 0);
  graphicsYellow.generateTexture('yellowStar', 128, 128);
  graphicsYellow.destroy();

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'redStar');

  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 拖拽时改变为黄色
    this.setTexture('yellowStar');
  });

  // 监听拖拽事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新星形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 改回红色
    this.setTexture('redStar');
    
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
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '松手后星形会回到中心位置', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);