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
  
  // 创建青色三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制青色三角形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillTriangle(
    50, 10,   // 顶点
    10, 90,   // 左下
    90, 90    // 右下
  );
  graphics.generateTexture('cyanTriangle', 100, 100);
  graphics.destroy();
  
  // 创建黄色三角形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillTriangle(
    50, 10,
    10, 90,
    90, 90
  );
  graphicsYellow.generateTexture('yellowTriangle', 100, 100);
  graphicsYellow.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'cyanTriangle');
  
  // 设置为可交互并启用拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowTriangle');
    // 可选：添加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新三角形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('cyanTriangle');
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