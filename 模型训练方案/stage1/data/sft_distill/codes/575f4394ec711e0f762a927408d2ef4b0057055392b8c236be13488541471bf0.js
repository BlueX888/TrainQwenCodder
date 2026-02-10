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
  // 创建青色星形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillStar(50, 50, 5, 20, 40);
  graphics.generateTexture('cyanStar', 100, 100);
  graphics.destroy();

  // 创建黄色星形纹理（拖拽时使用）
  const yellowGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  yellowGraphics.fillStyle(0xffff00, 1); // 黄色
  yellowGraphics.fillStar(50, 50, 5, 20, 40);
  yellowGraphics.generateTexture('yellowStar', 100, 100);
  yellowGraphics.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'cyanStar');

  // 启用交互和拖拽
  star.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowStar');
    // 可选：增加缩放效果
    this.setScale(1.1);
    text.setText('拖拽中...');
  });

  // 监听拖拽事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新星形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('cyanStar');
    // 恢复缩放
    this.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    text.setText('拖拽星形试试！');
  });

  // 添加鼠标悬停效果
  star.on('pointerover', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1.05);
    }
  });

  star.on('pointerout', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1);
    }
  });
}

new Phaser.Game(config);