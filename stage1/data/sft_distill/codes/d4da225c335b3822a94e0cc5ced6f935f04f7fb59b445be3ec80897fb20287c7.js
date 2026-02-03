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
  
  // 创建红色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillTriangle(
    50, 10,   // 顶点
    10, 90,   // 左下
    90, 90    // 右下
  );
  graphics.generateTexture('redTriangle', 100, 100);
  graphics.destroy();
  
  // 创建蓝色三角形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x0000ff, 1);
  graphicsBlue.fillTriangle(
    50, 10,
    10, 90,
    90, 90
  );
  graphicsBlue.generateTexture('blueTriangle', 100, 100);
  graphicsBlue.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'redTriangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('blueTriangle');
    // 可选：增加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽中事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复红色
    this.setTexture('redTriangle');
    // 恢复缩放
    this.setScale(1);
    
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
  this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);