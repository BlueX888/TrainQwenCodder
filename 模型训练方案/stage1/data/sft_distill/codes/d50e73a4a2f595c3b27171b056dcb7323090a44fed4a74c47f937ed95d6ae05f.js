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
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillEllipse(50, 40, 100, 80); // 中心点(50,40)，宽100，高80
  graphics.generateTexture('redEllipse', 100, 80);
  graphics.destroy();
  
  // 创建绿色椭圆纹理（拖拽时使用）
  const graphicsGreen = this.add.graphics();
  graphicsGreen.fillStyle(0x00ff00, 1);
  graphicsGreen.fillEllipse(50, 40, 100, 80);
  graphicsGreen.generateTexture('greenEllipse', 100, 80);
  graphicsGreen.destroy();
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'redEllipse');
  
  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  ellipse.on('dragstart', function(pointer) {
    // 拖拽时变为绿色
    this.setTexture('greenEllipse');
  });
  
  // 监听拖拽中事件
  ellipse.on('drag', function(pointer, dragX, dragY) {
    // 更新椭圆位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  ellipse.on('dragend', function(pointer) {
    // 恢复红色
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
  const text = this.add.text(400, 50, '拖拽红色椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);