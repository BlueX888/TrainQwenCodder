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
  
  // 创建青色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 顶点
  graphics.lineTo(64, 32);   // 右点
  graphics.lineTo(32, 64);   // 底点
  graphics.lineTo(0, 32);    // 左点
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('diamondCyan', 64, 64);
  graphics.destroy();
  
  // 创建黄色菱形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.beginPath();
  graphicsYellow.moveTo(32, 0);
  graphicsYellow.lineTo(64, 32);
  graphicsYellow.lineTo(32, 64);
  graphicsYellow.lineTo(0, 32);
  graphicsYellow.closePath();
  graphicsYellow.fillPath();
  graphicsYellow.generateTexture('diamondYellow', 64, 64);
  graphicsYellow.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondCyan');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);
  
  // 监听拖拽开始事件
  diamond.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('diamondYellow');
  });
  
  // 监听拖拽事件
  diamond.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('diamondCyan');
    
    // 回到初始位置（添加缓动效果）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);