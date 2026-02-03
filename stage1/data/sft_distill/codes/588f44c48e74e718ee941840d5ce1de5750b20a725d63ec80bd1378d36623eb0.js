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
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillTriangle(
    0, -40,    // 顶点
    -35, 40,   // 左下
    35, 40     // 右下
  );
  graphics.generateTexture('cyanTriangle', 70, 80);
  graphics.destroy();
  
  // 创建黄色三角形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillTriangle(
    0, -40,
    -35, 40,
    35, 40
  );
  graphicsYellow.generateTexture('yellowTriangle', 70, 80);
  graphicsYellow.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'cyanTriangle');
  
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
    // 提升层级
    this.setDepth(1);
  });
  
  // 监听拖拽事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('cyanTriangle');
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // 恢复层级
    this.setDepth(0);
  });
  
  // 添加鼠标悬停效果
  triangle.on('pointerover', function() {
    this.setScale(1.1);
  });
  
  triangle.on('pointerout', function() {
    this.setScale(1);
  });
}

new Phaser.Game(config);