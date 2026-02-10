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
  // 不需要预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 使用 Graphics 绘制白色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillTriangle(
    50, 10,   // 顶点
    10, 90,   // 左下
    90, 90    // 右下
  );
  graphics.generateTexture('whiteTriangle', 100, 100);
  graphics.destroy();
  
  // 绘制红色三角形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.fillTriangle(
    50, 10,
    10, 90,
    90, 90
  );
  redGraphics.generateTexture('redTriangle', 100, 100);
  redGraphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'whiteTriangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  hintText.setOrigin(0.5);
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('redTriangle');
  });
  
  // 监听拖拽事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复白色
    this.setTexture('whiteTriangle');
    
    // 回到初始位置（添加平滑过渡效果）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加悬停效果
  triangle.on('pointerover', function() {
    this.setScale(1.1);
  });
  
  triangle.on('pointerout', function() {
    this.setScale(1);
  });
}

new Phaser.Game(config);