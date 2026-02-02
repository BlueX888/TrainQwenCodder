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

  // 使用 Graphics 绘制红色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillStar(32, 32, 5, 16, 32, 0);
  graphics.generateTexture('redStar', 64, 64);
  graphics.destroy();

  // 使用 Graphics 绘制蓝色星形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x0000ff, 1);
  graphicsBlue.fillStar(32, 32, 5, 16, 32, 0);
  graphicsBlue.generateTexture('blueStar', 64, 64);
  graphicsBlue.destroy();

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'redStar');

  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 拖拽时改变为蓝色
    this.setTexture('blueStar');
  });

  // 监听拖拽事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新星形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 恢复红色
    this.setTexture('redStar');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });

  // 添加提示文字
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '松手后会回到中心位置', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);