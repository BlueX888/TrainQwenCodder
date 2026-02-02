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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillCircle(50, 50, 50); // 在 (50,50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();

  // 创建可拖拽的圆形精灵
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  circle.on('dragstart', function(pointer, dragX, dragY) {
    this.setScale(1.2);
  });
  
  // 监听拖拽过程事件 - 更新位置
  circle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原始大小
  circle.on('dragend', function(pointer, dragX, dragY) {
    this.setScale(1.0);
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);