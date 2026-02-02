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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制一个等边三角形（中心在 50, 50）
  const triangleSize = 60;
  graphics.fillTriangle(
    50, 50 - triangleSize * 0.577,  // 顶点（上）
    50 - triangleSize / 2, 50 + triangleSize * 0.289,  // 左下顶点
    50 + triangleSize / 2, 50 + triangleSize * 0.289   // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 放大到 1.2 倍
    this.setScale(1.2);
  });
  
  // 监听拖拽事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新三角形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复原大小
    this.setScale(1.0);
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);