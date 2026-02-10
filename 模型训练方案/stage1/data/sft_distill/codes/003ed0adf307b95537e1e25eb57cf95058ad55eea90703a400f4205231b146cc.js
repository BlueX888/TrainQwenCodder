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
  
  // 使用 Graphics 绘制白色三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制白色三角形
  graphics.fillStyle(0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(0, -40);  // 顶点
  graphics.lineTo(-35, 40);  // 左下角
  graphics.lineTo(35, 40);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成白色三角形纹理
  graphics.generateTexture('whiteTriangle', 70, 80);
  graphics.clear();
  
  // 绘制红色三角形纹理（拖拽时使用）
  graphics.fillStyle(0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, -40);
  graphics.lineTo(-35, 40);
  graphics.lineTo(35, 40);
  graphics.closePath();
  graphics.fillPath();
  
  // 生成红色三角形纹理
  graphics.generateTexture('redTriangle', 70, 80);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'whiteTriangle');
  
  // 设置为可交互
  triangle.setInteractive({ draggable: true });
  
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
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);