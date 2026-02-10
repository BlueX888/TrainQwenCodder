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
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的方块
  const box = this.add.sprite(initialX, initialY, 'whiteBox');
  
  // 启用交互和拖拽
  box.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽白色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  box.on('dragstart', function(pointer) {
    // 拖拽时改变为蓝色
    this.setTexture('blueBox');
    // 稍微放大一点，提供视觉反馈
    this.setScale(1.1);
  });

  // 监听拖拽事件
  box.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  box.on('dragend', function(pointer) {
    // 恢复为白色
    this.setTexture('whiteBox');
    // 恢复原始大小
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

  // 添加悬停效果
  box.on('pointerover', function() {
    if (!this.scene.input.dragState) {
      this.setAlpha(0.8);
    }
  });

  box.on('pointerout', function() {
    this.setAlpha(1);
  });
}

new Phaser.Game(config);