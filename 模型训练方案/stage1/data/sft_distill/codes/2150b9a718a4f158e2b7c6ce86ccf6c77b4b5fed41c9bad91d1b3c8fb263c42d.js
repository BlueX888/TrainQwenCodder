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

// 记录初始位置
let initialX = 400;
let initialY = 300;

function preload() {
  // 创建粉色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(50, 50, 100, 60); // 在中心绘制椭圆
  graphics.generateTexture('pinkEllipse', 100, 100);
  graphics.destroy();

  // 创建深色椭圆纹理（拖拽时使用）
  const darkGraphics = this.add.graphics();
  darkGraphics.fillStyle(0xff1493, 1); // 深粉色
  darkGraphics.fillEllipse(50, 50, 100, 60);
  darkGraphics.generateTexture('darkEllipse', 100, 100);
  darkGraphics.destroy();
}

function create() {
  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'pinkEllipse');
  
  // 启用交互
  ellipse.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽粉色椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  ellipse.on('dragstart', function(pointer) {
    // 改变为深色
    this.setTexture('darkEllipse');
    // 增加透明度效果
    this.setAlpha(0.8);
  });

  // 监听拖拽中事件
  ellipse.on('drag', function(pointer, dragX, dragY) {
    // 更新椭圆位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  ellipse.on('dragend', function(pointer) {
    // 恢复原始颜色
    this.setTexture('pinkEllipse');
    // 恢复透明度
    this.setAlpha(1);
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  ellipse.on('pointerover', function() {
    this.setScale(1.1);
  });

  ellipse.on('pointerout', function() {
    this.setScale(1);
  });
}

new Phaser.Game(config);