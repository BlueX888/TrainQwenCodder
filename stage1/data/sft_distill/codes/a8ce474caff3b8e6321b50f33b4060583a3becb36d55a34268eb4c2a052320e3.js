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
  // 不需要预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建粉色星形纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillStar(50, 50, 5, 20, 40); // 5个角的星形
  pinkGraphics.generateTexture('pinkStar', 100, 100);
  pinkGraphics.destroy();
  
  // 创建黄色星形纹理（拖拽时使用）
  const yellowGraphics = this.add.graphics();
  yellowGraphics.fillStyle(0xffff00, 1); // 黄色
  yellowGraphics.fillStar(50, 50, 5, 20, 40);
  yellowGraphics.generateTexture('yellowStar', 100, 100);
  yellowGraphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'pinkStar');
  
  // 设置为可交互并启用拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowStar');
    // 可选：增加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽中事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新星形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 恢复粉色
    this.setTexture('pinkStar');
    // 恢复缩放
    this.setScale(1);
    
    // 使用缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);