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
  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x888888, 1);
  
  // 绘制菱形路径
  const diamond = new Phaser.Geom.Polygon([
    0, -50,    // 上顶点
    50, 0,     // 右顶点
    0, 50,     // 下顶点
    -50, 0     // 左顶点
  ]);
  
  graphics.fillPoints(diamond.points, true);
  graphics.generateTexture('diamondGray', 100, 100);
  graphics.destroy();
  
  // 创建蓝色菱形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x4444ff, 1);
  graphicsBlue.fillPoints(diamond.points, true);
  graphicsBlue.generateTexture('diamondBlue', 100, 100);
  graphicsBlue.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondGray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);
  
  // 监听拖拽开始事件 - 改变颜色
  diamond.on('dragstart', function(pointer) {
    this.setTexture('diamondBlue');
  });
  
  // 监听拖拽中事件 - 更新位置
  diamond.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复颜色和位置
  diamond.on('dragend', function(pointer) {
    this.setTexture('diamondGray');
    
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
  this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);