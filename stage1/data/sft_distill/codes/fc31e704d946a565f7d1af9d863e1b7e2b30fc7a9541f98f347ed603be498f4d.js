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
  
  // 使用 Graphics 创建灰色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形路径
  const size = 60;
  const path = new Phaser.Geom.Polygon([
    0, -size,      // 上顶点
    size, 0,       // 右顶点
    0, size,       // 下顶点
    -size, 0       // 左顶点
  ]);
  
  // 填充灰色
  graphics.fillStyle(0x808080, 1);
  graphics.fillPath();
  graphics.fillPoints(path.points, true);
  
  // 生成灰色菱形纹理
  graphics.generateTexture('diamondGray', size * 2, size * 2);
  graphics.clear();
  
  // 绘制蓝色菱形纹理（拖拽时使用）
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillPoints(path.points, true);
  graphics.generateTexture('diamondBlue', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondGray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  diamond.on(Phaser.Input.Events.DRAG_START, (pointer, dragX, dragY) => {
    // 拖拽时改变为蓝色
    diamond.setTexture('diamondBlue');
  });
  
  // 监听拖拽中事件
  diamond.on(Phaser.Input.Events.DRAG, (pointer, dragX, dragY) => {
    // 更新菱形位置
    diamond.x = dragX;
    diamond.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on(Phaser.Input.Events.DRAG_END, (pointer, dragX, dragY) => {
    // 恢复灰色
    diamond.setTexture('diamondGray');
    
    // 使用补间动画回到初始位置
    this.tweens.add({
      targets: diamond,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  const instructionText = this.add.text(400, 50, '拖动菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  instructionText.setOrigin(0.5);
}

new Phaser.Game(config);