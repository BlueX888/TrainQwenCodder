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
  // 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('whiteBox', 100, 100);
  graphics.destroy();

  // 创建蓝色方块纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x4a90e2, 1);
  graphicsBlue.fillRect(0, 0, 100, 100);
  graphicsBlue.generateTexture('blueBox', 100, 100);
  graphicsBlue.destroy();
}

function create() {
  // 添加标题文字
  this.add.text(400, 50, '拖拽白色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建可拖拽的方块
  const box = this.add.sprite(400, 300, 'whiteBox');
  
  // 保存初始位置
  const initialX = box.x;
  const initialY = box.y;

  // 设置为可交互和可拖拽
  box.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  box.on('dragstart', function(pointer) {
    // 拖拽时改变为蓝色
    this.setTexture('blueBox');
    // 添加缩放效果
    this.setScale(1.1);
  });

  // 监听拖拽中事件
  box.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  box.on('dragend', function(pointer) {
    // 恢复白色
    this.setTexture('whiteBox');
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
  this.add.text(400, 550, '松手后方块会自动回到中心位置', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);
}

new Phaser.Game(config);