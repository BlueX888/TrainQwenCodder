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
  // 无需预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建蓝色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.beginPath();
  graphics.moveTo(0, -40);  // 顶点
  graphics.lineTo(-35, 40);  // 左下角
  graphics.lineTo(35, 40);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('blueTriangle', 70, 80);
  graphics.destroy();
  
  // 创建红色三角形纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1);
  graphicsRed.beginPath();
  graphicsRed.moveTo(0, -40);
  graphicsRed.lineTo(-35, 40);
  graphicsRed.lineTo(35, 40);
  graphicsRed.closePath();
  graphicsRed.fillPath();
  graphicsRed.generateTexture('redTriangle', 70, 80);
  graphicsRed.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'blueTriangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 变为红色
  triangle.on('dragstart', function(pointer, dragX, dragY) {
    this.setTexture('redTriangle');
  });
  
  // 监听拖拽事件 - 更新位置
  triangle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复蓝色并回到初始位置
  triangle.on('dragend', function(pointer, dragX, dragY) {
    this.setTexture('blueTriangle');
    
    // 使用补间动画平滑回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);