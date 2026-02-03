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
  
  // 创建粉色椭圆纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillEllipse(50, 50, 100, 60); // 中心点(50,50)，宽100，高60
  pinkGraphics.generateTexture('pinkEllipse', 100, 100);
  pinkGraphics.destroy();
  
  // 创建蓝色椭圆纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4169e1, 1); // 蓝色
  blueGraphics.fillEllipse(50, 50, 100, 60);
  blueGraphics.generateTexture('blueEllipse', 100, 100);
  blueGraphics.destroy();
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'pinkEllipse');
  
  // 启用交互和拖拽
  ellipse.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 变为蓝色
  ellipse.on('dragstart', function(pointer, dragX, dragY) {
    this.setTexture('blueEllipse');
  });
  
  // 监听拖拽中事件 - 更新位置
  ellipse.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复粉色并回到初始位置
  ellipse.on('dragend', function(pointer, dragX, dragY) {
    this.setTexture('pinkEllipse');
    
    // 使用补间动画平滑回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽粉色椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);