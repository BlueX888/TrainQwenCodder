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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心在原点）
  const size = 60;
  const height = size * Math.sqrt(3) / 2;
  graphics.fillTriangle(
    0, -height * 2/3,           // 顶点
    -size / 2, height * 1/3,    // 左下
    size / 2, height * 1/3      // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', size, size);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  triangle.on('dragstart', function(pointer) {
    // 放大到 1.2 倍
    this.setScale(1.2);
    // 提升深度，使其在最上层
    this.setDepth(1);
  });
  
  // 监听拖拽事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置到指针位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复原始大小
    this.setScale(1);
    // 恢复深度
    this.setDepth(0);
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);