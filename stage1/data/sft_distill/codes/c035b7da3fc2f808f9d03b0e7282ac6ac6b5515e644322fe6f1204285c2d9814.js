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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心在原点）
  const size = 60;
  graphics.fillTriangle(
    0, -size,           // 顶点
    -size, size,        // 左下角
    size, size          // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', size * 2, size * 2);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建三角形精灵并放置在屏幕中央
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  triangle.on('dragstart', function(pointer, dragX, dragY) {
    this.setScale(1.2);
  });
  
  // 监听拖拽事件 - 更新位置
  triangle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原大小
  triangle.on('dragend', function(pointer, dragX, dragY) {
    this.setScale(1);
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);