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
  
  // 创建白色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制白色菱形
  graphics.fillStyle(0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 顶点
  graphics.lineTo(100, 50);  // 右点
  graphics.lineTo(50, 100);  // 底点
  graphics.lineTo(0, 50);    // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成白色菱形纹理
  graphics.generateTexture('diamondWhite', 100, 100);
  graphics.clear();
  
  // 绘制红色菱形纹理（拖拽时使用）
  graphics.fillStyle(0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);
  graphics.lineTo(100, 50);
  graphics.lineTo(50, 100);
  graphics.lineTo(0, 50);
  graphics.closePath();
  graphics.fillPath();
  
  // 生成红色菱形纹理
  graphics.generateTexture('diamondRed', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondWhite');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  diamond.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('diamondRed');
  });
  
  // 监听拖拽事件
  diamond.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on('dragend', function(pointer) {
    // 改变回白色
    this.setTexture('diamondWhite');
    
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
  this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);