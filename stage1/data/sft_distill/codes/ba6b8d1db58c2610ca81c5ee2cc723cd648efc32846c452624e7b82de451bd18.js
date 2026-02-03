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
  
  // 创建绿色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillTriangle(0, -40, -35, 40, 35, 40);
  graphics.generateTexture('greenTriangle', 70, 80);
  graphics.destroy();
  
  // 创建黄色三角形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillTriangle(0, -40, -35, 40, 35, 40);
  graphicsYellow.generateTexture('yellowTriangle', 70, 80);
  graphicsYellow.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'greenTriangle');
  
  // 启用拖拽交互
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowTriangle');
  });
  
  // 监听拖拽中事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复绿色
    this.setTexture('greenTriangle');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });
  
  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);