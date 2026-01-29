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
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制一个等边三角形（中心点在 50, 50）
  // 三个顶点坐标
  const x1 = 50, y1 = 20;  // 顶部顶点
  const x2 = 20, y2 = 80;  // 左下顶点
  const x3 = 80, y3 = 80;  // 右下顶点
  
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  
  // 销毁 graphics 对象（已生成纹理，不再需要）
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
  
  // 监听拖拽中事件
  triangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  triangle.on('dragend', function(pointer) {
    // 恢复原始大小
    this.setScale(1.0);
  });
  
  // 添加提示文本
  const instructionText = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);