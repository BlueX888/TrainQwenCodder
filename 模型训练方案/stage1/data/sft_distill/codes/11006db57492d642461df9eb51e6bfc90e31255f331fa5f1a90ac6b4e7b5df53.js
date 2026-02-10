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

// 记录星形初始位置
let initialX = 400;
let initialY = 300;

function preload() {
  // 创建蓝色星形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x0099ff, 1);
  graphics.fillStar(64, 64, 5, 32, 64, 0);
  graphics.generateTexture('blueStar', 128, 128);
  graphics.destroy();

  // 创建黄色星形纹理
  const graphicsYellow = this.make.graphics({ x: 0, y: 0, add: false });
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(64, 64, 5, 32, 64, 0);
  graphicsYellow.generateTexture('yellowStar', 128, 128);
  graphicsYellow.destroy();
}

function create() {
  // 添加标题文字
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'blueStar');

  // 启用交互并设置为可拖拽
  star.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowStar');
    // 增加缩放效果
    this.setScale(1.1);
  });

  // 监听拖拽中事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新星形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 恢复蓝色
    this.setTexture('blueStar');
    // 恢复原始缩放
    this.setScale(1);
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加提示文字
  this.add.text(400, 550, '松手后星形会回到中心位置', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);