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
  
  // 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillStar(64, 64, 5, 32, 64, 0); // 中心点(64,64), 5个角, 内半径32, 外半径64
  graphics.generateTexture('cyanStar', 128, 128);
  graphics.destroy();
  
  // 创建黄色星形纹理（拖拽时使用）
  const graphics2 = this.add.graphics();
  graphics2.fillStyle(0xffff00, 1); // 黄色
  graphics2.fillStar(64, 64, 5, 32, 64, 0);
  graphics2.generateTexture('yellowStar', 128, 128);
  graphics2.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'cyanStar');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowStar');
  });
  
  // 监听拖拽中事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('cyanStar');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);