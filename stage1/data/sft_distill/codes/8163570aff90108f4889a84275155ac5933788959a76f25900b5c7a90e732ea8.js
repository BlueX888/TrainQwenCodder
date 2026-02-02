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
  // 创建红色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillEllipse(60, 40, 120, 80);
  graphics.generateTexture('redEllipse', 120, 80);
  graphics.destroy();

  // 创建蓝色椭圆纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x0000ff, 1);
  graphicsBlue.fillEllipse(60, 40, 120, 80);
  graphicsBlue.generateTexture('blueEllipse', 120, 80);
  graphicsBlue.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'redEllipse');

  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽红色椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  ellipse.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('blueEllipse');
  });

  // 监听拖拽事件
  ellipse.on('drag', function(pointer, dragX, dragY) {
    // 更新椭圆位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  ellipse.on('dragend', function(pointer) {
    // 恢复红色
    this.setTexture('redEllipse');
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加鼠标悬停效果（可选）
  ellipse.on('pointerover', function() {
    this.setScale(1.1);
  });

  ellipse.on('pointerout', function() {
    this.setScale(1.0);
  });
}

new Phaser.Game(config);