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
  // 创建青色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillTriangle(
    50, 0,    // 顶点
    0, 100,   // 左下
    100, 100  // 右下
  );
  graphics.generateTexture('cyanTriangle', 100, 100);
  graphics.destroy();

  // 创建黄色三角形纹理
  const graphicsYellow = this.make.graphics({ x: 0, y: 0, add: false });
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillTriangle(
    50, 0,
    0, 100,
    100, 100
  );
  graphicsYellow.generateTexture('yellowTriangle', 100, 100);
  graphicsYellow.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'cyanTriangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowTriangle');
    this.setScale(1.1); // 稍微放大一点
  });

  // 监听拖拽中事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('cyanTriangle');
    this.setScale(1); // 恢复原始大小
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加状态提示文本
  const statusText = this.add.text(400, 550, '状态: 等待拖拽', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 更新状态文本
  triangle.on('dragstart', function() {
    statusText.setText('状态: 拖拽中...');
  });

  triangle.on('dragend', function() {
    statusText.setText('状态: 返回初始位置');
    this.scene.time.delayedCall(500, () => {
      statusText.setText('状态: 等待拖拽');
    });
  });
}

new Phaser.Game(config);