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
    0, -40,    // 顶点
    -35, 40,   // 左下
    35, 40     // 右下
  );
  graphics.generateTexture('redTriangle', 70, 80);
  graphics.destroy();
  
  // 创建蓝色三角形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x0000ff, 1);
  graphicsBlue.fillTriangle(
    0, -40,
    -35, 40,
    35, 40
  );
  graphicsBlue.generateTexture('blueTriangle', 70, 80);
  graphicsBlue.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'redTriangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('blueTriangle');
    // 增加缩放效果
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
    // 改回红色
    this.setTexture('redTriangle');
    // 恢复缩放
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
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);