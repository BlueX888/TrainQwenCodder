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

// 存储初始位置
let initialX = 400;
let initialY = 300;
let rectangle;

function preload() {
  // 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 120, 80);
  graphics.generateTexture('yellowRect', 120, 80);
  graphics.destroy();

  // 创建红色矩形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1); // 红色
  redGraphics.fillRect(0, 0, 120, 80);
  redGraphics.generateTexture('redRect', 120, 80);
  redGraphics.destroy();
}

function create() {
  // 创建可拖拽的矩形精灵
  rectangle = this.add.sprite(initialX, initialY, 'yellowRect');
  
  // 设置为可交互
  rectangle.setInteractive({ draggable: true });
  
  // 添加拖拽开始事件 - 改变颜色为红色
  rectangle.on('dragstart', function(pointer, dragX, dragY) {
    this.setTexture('redRect');
  });
  
  // 添加拖拽事件 - 更新位置
  rectangle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 添加拖拽结束事件 - 恢复黄色并回到初始位置
  rectangle.on('dragend', function(pointer, dragX, dragY) {
    this.setTexture('yellowRect');
    
    // 使用补间动画平滑回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽黄色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);