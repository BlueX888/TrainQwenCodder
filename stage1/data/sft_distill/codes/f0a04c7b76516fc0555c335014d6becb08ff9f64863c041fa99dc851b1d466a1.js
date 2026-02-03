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
  
  // 创建粉色星形纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillStar(50, 50, 5, 40, 20); // 中心点(50,50), 5个角, 外半径40, 内半径20
  pinkGraphics.generateTexture('pinkStar', 100, 100);
  pinkGraphics.destroy();
  
  // 创建黄色星形纹理（拖拽时使用）
  const yellowGraphics = this.add.graphics();
  yellowGraphics.fillStyle(0xffff00, 1); // 黄色
  yellowGraphics.fillStar(50, 50, 5, 40, 20);
  yellowGraphics.generateTexture('yellowStar', 100, 100);
  yellowGraphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'pinkStar');
  
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
    this.setTexture('yellowStar');
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
    // 恢复粉色
    this.setTexture('pinkStar');
    // 恢复缩放
    this.setScale(1);
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    text.setText('松手后回到初始位置');
    
    // 2秒后恢复提示文本
    this.scene.time.delayedCall(2000, () => {
      text.setText('拖拽星形试试！');
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