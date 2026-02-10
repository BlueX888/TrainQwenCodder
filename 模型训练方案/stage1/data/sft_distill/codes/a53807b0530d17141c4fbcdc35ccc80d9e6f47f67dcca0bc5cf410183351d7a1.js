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
  const initialX = 400;
  const initialY = 300;
  
  // 使用 Graphics 创建黄色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillStar(32, 32, 5, 16, 32, 0); // 5个角，内半径16，外半径32
  graphics.generateTexture('yellowStar', 64, 64);
  graphics.destroy();
  
  // 创建红色星形纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1); // 红色
  graphicsRed.fillStar(32, 32, 5, 16, 32, 0);
  graphicsRed.generateTexture('redStar', 64, 64);
  graphicsRed.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'yellowStar');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('redStar');
    // 可选：增加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新星形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 恢复为黄色
    this.setTexture('yellowStar');
    // 恢复原始缩放
    this.setScale(1);
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖动星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);