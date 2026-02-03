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
  
  // 创建红色椭圆纹理
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.fillEllipse(60, 40, 120, 80); // 中心点(60,40)，宽120，高80
  redGraphics.generateTexture('redEllipse', 120, 80);
  redGraphics.destroy();
  
  // 创建蓝色椭圆纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x0000ff, 1);
  blueGraphics.fillEllipse(60, 40, 120, 80);
  blueGraphics.generateTexture('blueEllipse', 120, 80);
  blueGraphics.destroy();
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'redEllipse');
  
  // 启用交互和拖拽
  ellipse.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 变为蓝色
  ellipse.on('dragstart', function(pointer, dragX, dragY) {
    this.setTexture('blueEllipse');
  });
  
  // 监听拖拽事件 - 更新位置
  ellipse.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复红色并回到初始位置
  ellipse.on('dragend', function(pointer, dragX, dragY) {
    this.setTexture('redEllipse');
    
    // 使用补间动画平滑回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽红色椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);