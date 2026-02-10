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
  // 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1);
  graphics.fillCircle(50, 50, 50);
  graphics.generateTexture('purpleCircle', 100, 100);
  graphics.destroy();

  // 创建拖拽时的亮紫色圆形纹理
  const graphicsLight = this.add.graphics();
  graphicsLight.fillStyle(0xcc99ff, 1);
  graphicsLight.fillCircle(50, 50, 50);
  graphicsLight.generateTexture('lightPurpleCircle', 100, 100);
  graphicsLight.destroy();
}

function create() {
  // 记录初始位置
  const startX = 400;
  const startY = 300;

  // 创建可拖拽的圆形精灵
  const circle = this.add.sprite(startX, startY, 'purpleCircle');
  
  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', function(pointer) {
    // 改变为亮紫色
    this.setTexture('lightPurpleCircle');
    // 增加缩放效果
    this.setScale(1.1);
  });

  // 监听拖拽中事件
  circle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', function(pointer) {
    // 恢复原始颜色
    this.setTexture('purpleCircle');
    // 恢复原始缩放
    this.setScale(1);
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: startX,
      y: startY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  circle.on('pointerover', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1.05);
    }
  });

  circle.on('pointerout', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1);
    }
  });
}

new Phaser.Game(config);