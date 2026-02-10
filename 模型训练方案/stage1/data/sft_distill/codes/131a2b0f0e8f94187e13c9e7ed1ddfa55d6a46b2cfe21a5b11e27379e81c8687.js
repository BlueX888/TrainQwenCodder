const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  const radius = 50;

  // 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillCircle(radius, radius, radius);
  graphics.generateTexture('purpleCircle', radius * 2, radius * 2);
  graphics.destroy();

  // 创建浅紫色圆形纹理（拖拽时使用）
  const graphicsLight = this.add.graphics();
  graphicsLight.fillStyle(0xd7bde2, 1); // 浅紫色
  graphicsLight.fillCircle(radius, radius, radius);
  graphicsLight.generateTexture('lightPurpleCircle', radius * 2, radius * 2);
  graphicsLight.destroy();

  // 创建可拖拽的圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'purpleCircle');
  
  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽紫色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 改变为浅紫色
    this.setTexture('lightPurpleCircle');
    // 提升层级
    this.setDepth(1);
  });

  // 监听拖拽事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新圆形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复为紫色
    this.setTexture('purpleCircle');
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // 恢复层级
    this.setDepth(0);
  });

  // 添加鼠标悬停效果
  circle.on('pointerover', function() {
    this.setScale(1.1);
  });

  circle.on('pointerout', function() {
    this.setScale(1.0);
  });
}

new Phaser.Game(config);