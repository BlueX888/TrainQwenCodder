const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  
  // 定义菱形的四个顶点（中心点在 50, 50）
  const diamond = new Phaser.Geom.Polygon([
    50, 0,    // 上顶点
    100, 50,  // 右顶点
    50, 100,  // 下顶点
    0, 50     // 左顶点
  ]);
  
  graphics.fillPoints(diamond.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵并设置在屏幕中央
  const diamondSprite = this.add.sprite(400, 300, 'diamond');
  
  // 设置为可交互和可拖拽
  diamondSprite.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  diamondSprite.on('dragstart', function(pointer) {
    this.setScale(1.2);
  });
  
  // 监听拖拽事件 - 更新位置
  diamondSprite.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原大小
  diamondSprite.on('dragend', function(pointer) {
    this.setScale(1.0);
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);