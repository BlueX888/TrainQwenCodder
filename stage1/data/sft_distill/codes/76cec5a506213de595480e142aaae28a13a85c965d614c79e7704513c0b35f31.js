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
  
  // 创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('blueBox', 100, 100);
  graphics.destroy();
  
  // 创建红色方块纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1);
  graphicsRed.fillRect(0, 0, 100, 100);
  graphicsRed.generateTexture('redBox', 100, 100);
  graphicsRed.destroy();
  
  // 创建可拖拽的方块
  const box = this.add.sprite(initialX, initialY, 'blueBox');
  
  // 设置为可交互和可拖拽
  box.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  box.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('redBox');
  });
  
  // 监听拖拽中事件
  box.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  box.on('dragend', function(pointer) {
    // 恢复蓝色
    this.setTexture('blueBox');
    
    // 使用补间动画平滑回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽蓝色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);