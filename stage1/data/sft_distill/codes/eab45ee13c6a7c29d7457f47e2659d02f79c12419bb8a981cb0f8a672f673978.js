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
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建青色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillEllipse(60, 40, 120, 80); // 中心点偏移，宽120，高80
  graphics.generateTexture('cyanEllipse', 120, 80);
  graphics.destroy();
  
  // 创建黄色椭圆纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillEllipse(60, 40, 120, 80);
  graphicsYellow.generateTexture('yellowEllipse', 120, 80);
  graphicsYellow.destroy();
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'cyanEllipse');
  
  // 设置可交互和可拖拽
  ellipse.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听拖拽开始事件
  ellipse.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowEllipse');
    text.setText('拖拽中...');
  });
  
  // 监听拖拽事件
  ellipse.on('drag', function(pointer, dragX, dragY) {
    // 更新椭圆位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  ellipse.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('cyanEllipse');
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    text.setText('拖拽椭圆试试！');
  });
  
  // 添加鼠标悬停效果
  ellipse.on('pointerover', function() {
    this.setScale(1.1);
  });
  
  ellipse.on('pointerout', function() {
    this.setScale(1.0);
  });
}

new Phaser.Game(config);