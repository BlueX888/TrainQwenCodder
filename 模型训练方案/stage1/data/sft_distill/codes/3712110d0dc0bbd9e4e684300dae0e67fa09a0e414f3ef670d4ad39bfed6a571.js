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
  // 创建黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('yellowBox', 100, 100);
  graphics.destroy();

  // 创建红色方块纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.fillRect(0, 0, 100, 100);
  redGraphics.generateTexture('redBox', 100, 100);
  redGraphics.destroy();
}

function create() {
  // 添加提示文字
  this.add.text(400, 50, '拖拽黄色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建可拖拽的方块
  const box = this.add.sprite(initialX, initialY, 'yellowBox');
  
  // 设置为可交互并启用拖拽
  box.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  box.on('dragstart', function(pointer) {
    // 拖拽时改变为红色
    this.setTexture('redBox');
    // 可选：增加一些视觉反馈
    this.setScale(1.1);
  });

  // 监听拖拽中事件
  box.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  box.on('dragend', function(pointer) {
    // 恢复原始颜色
    this.setTexture('yellowBox');
    // 恢复原始大小
    this.setScale(1);
    
    // 使用补间动画平滑回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加鼠标悬停效果（可选增强）
  box.on('pointerover', function() {
    if (!this.scene.input.dragState) {
      this.setTint(0xffdd00); // 稍微变亮
    }
  });

  box.on('pointerout', function() {
    this.clearTint();
  });
}

new Phaser.Game(config);