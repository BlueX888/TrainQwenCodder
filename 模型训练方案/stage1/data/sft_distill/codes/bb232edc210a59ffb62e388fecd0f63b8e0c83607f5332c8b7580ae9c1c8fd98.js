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
  
  // 创建粉色方块纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillRect(0, 0, 100, 100);
  pinkGraphics.generateTexture('pinkSquare', 100, 100);
  pinkGraphics.destroy();
  
  // 创建蓝色方块纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4169e1, 1); // 蓝色
  blueGraphics.fillRect(0, 0, 100, 100);
  blueGraphics.generateTexture('blueSquare', 100, 100);
  blueGraphics.destroy();
  
  // 创建可拖拽的方块
  const square = this.add.sprite(initialX, initialY, 'pinkSquare');
  
  // 设置为可交互并启用拖拽
  square.setInteractive({ draggable: true });
  
  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽粉色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
  
  // 监听拖拽开始事件
  square.on('dragstart', function(pointer) {
    // 改变颜色为蓝色
    this.setTexture('blueSquare');
  });
  
  // 监听拖拽中事件
  square.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  square.on('dragend', function(pointer) {
    // 恢复粉色
    this.setTexture('pinkSquare');
    
    // 回到初始位置（添加缓动动画）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加鼠标悬停效果
  square.on('pointerover', function() {
    this.setScale(1.1);
  });
  
  square.on('pointerout', function() {
    this.setScale(1);
  });
}

new Phaser.Game(config);