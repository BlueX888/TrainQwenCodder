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
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（三个顶点坐标）
  // 以中心为原点，绘制一个等边三角形
  const size = 60;
  const height = size * Math.sqrt(3) / 2;
  
  graphics.fillTriangle(
    0, -height * 2/3,           // 顶点
    -size/2, height * 1/3,      // 左下角
    size/2, height * 1/3        // 右下角
  );
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('triangle', size, size);
  graphics.destroy(); // 销毁 Graphics 对象，纹理已保存
  
  // 创建三角形精灵并放置在屏幕中央
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置为可交互并启用拖拽
  triangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  triangle.on('dragstart', function(pointer, dragX, dragY) {
    this.setScale(1.2);
  });
  
  // 监听拖拽中事件 - 更新位置
  triangle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原大小
  triangle.on('dragend', function(pointer, dragX, dragY) {
    this.setScale(1.0);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);