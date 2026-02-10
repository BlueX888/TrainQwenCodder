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
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x3498db, 1); // 蓝色椭圆
  graphics.fillEllipse(80, 60, 160, 120); // 中心点(80,60)，宽160，高120
  
  // 生成纹理
  graphics.generateTexture('ellipse', 160, 120);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  
  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  ellipse.on('dragstart', function(pointer) {
    this.setScale(1.2);
  });
  
  // 监听拖拽事件 - 更新位置
  ellipse.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原始大小
  ellipse.on('dragend', function(pointer) {
    this.setScale(1.0);
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽椭圆试试', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);