const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建粉色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.beginPath();
  graphics.moveTo(0, -40);  // 顶点
  graphics.lineTo(-35, 30);  // 左下角
  graphics.lineTo(35, 30);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('pinkTriangle', 70, 70);
  graphics.destroy();
  
  // 创建黄色三角形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.beginPath();
  graphicsYellow.moveTo(0, -40);
  graphicsYellow.lineTo(-35, 30);
  graphicsYellow.lineTo(35, 30);
  graphicsYellow.closePath();
  graphicsYellow.fillPath();
  graphicsYellow.generateTexture('yellowTriangle', 70, 70);
  graphicsYellow.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'pinkTriangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowTriangle');
    // 增加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽中事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新三角形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复粉色
    this.setTexture('pinkTriangle');
    // 恢复原始缩放
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
  triangle.on('pointerover', function() {
    if (!this.scene.input.activePointer.isDown) {
      this.setScale(1.05);
    }
  });
  
  triangle.on('pointerout', function() {
    if (!this.scene.input.activePointer.isDown) {
      this.setScale(1);
    }
  });
}

new Phaser.Game(config);