const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建粉色椭圆纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillEllipse(50, 50, 100, 60); // 在纹理中心绘制椭圆
  pinkGraphics.generateTexture('pinkEllipse', 100, 100);
  pinkGraphics.destroy();
  
  // 创建黄色椭圆纹理（拖拽时使用）
  const yellowGraphics = this.add.graphics();
  yellowGraphics.fillStyle(0xffff00, 1); // 黄色
  yellowGraphics.fillEllipse(50, 50, 100, 60);
  yellowGraphics.generateTexture('yellowEllipse', 100, 100);
  yellowGraphics.destroy();
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'pinkEllipse');
  
  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  ellipse.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowEllipse');
  });
  
  // 监听拖拽事件
  ellipse.on('drag', function(pointer, dragX, dragY) {
    // 更新椭圆位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  ellipse.on('dragend', function(pointer) {
    // 恢复粉色
    this.setTexture('pinkEllipse');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽粉色椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);