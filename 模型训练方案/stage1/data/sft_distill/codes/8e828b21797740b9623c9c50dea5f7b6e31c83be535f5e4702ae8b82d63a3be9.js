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
  
  // 使用 Graphics 绘制青色菱形
  const graphics = this.add.graphics();
  
  // 青色菱形
  graphics.fillStyle(0x00ffff, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成青色菱形纹理
  graphics.generateTexture('diamondCyan', 64, 64);
  graphics.clear();
  
  // 绘制黄色菱形（拖拽时使用）
  graphics.fillStyle(0xffff00, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);
  graphics.lineTo(64, 32);
  graphics.lineTo(32, 64);
  graphics.lineTo(0, 32);
  graphics.closePath();
  graphics.fillPath();
  
  // 生成黄色菱形纹理
  graphics.generateTexture('diamondYellow', 64, 64);
  graphics.destroy();
  
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
  this.add.text(400, 50, '拖拽青色菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);