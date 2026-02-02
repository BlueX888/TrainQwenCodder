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
  // 记录星形的初始位置
  const startX = 400;
  const startY = 300;

  // 创建红色星形纹理
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1);
  graphicsRed.fillStar(64, 64, 5, 32, 64, 0);
  graphicsRed.generateTexture('starRed', 128, 128);
  graphicsRed.destroy();

  // 创建黄色星形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(64, 64, 5, 32, 64, 0);
  graphicsYellow.generateTexture('starYellow', 128, 128);
  graphicsYellow.destroy();

  // 创建星形精灵
  const star = this.add.sprite(startX, startY, 'starRed');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('starYellow');
    // 增加缩放效果
    this.setScale(1.2);
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
    // 恢复红色
    this.setTexture('starRed');
    // 恢复缩放
    this.setScale(1);
    text.setText('松手后回到初始位置');
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: startX,
      y: startY,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: function() {
        text.setText('拖拽星形试试！');
      }
    });
  });

  // 添加鼠标悬停效果
  star.on('pointerover', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1.1);
    }
  });

  star.on('pointerout', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1);
    }
  });
}

new Phaser.Game(config);