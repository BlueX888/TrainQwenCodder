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
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制一个等边三角形（中心在 50, 50）
  const centerX = 50;
  const centerY = 50;
  const size = 40;
  
  graphics.fillTriangle(
    centerX, centerY - size,           // 顶点
    centerX - size, centerY + size,    // 左下
    centerX + size, centerY + size     // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置为可交互并启用拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 放大到 1.2 倍
    this.setScale(1.2);
  });
  
  // 监听拖拽中事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复原大小
    this.setScale(1.0);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);