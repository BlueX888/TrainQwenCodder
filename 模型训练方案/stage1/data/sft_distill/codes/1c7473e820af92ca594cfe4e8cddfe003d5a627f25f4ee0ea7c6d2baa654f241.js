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
  // 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('orangeBox', 100, 100);
  graphics.destroy();

  // 创建黄色方块纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillRect(0, 0, 100, 100);
  graphicsYellow.generateTexture('yellowBox', 100, 100);
  graphicsYellow.destroy();
}

function create() {
  // 添加标题文本
  this.add.text(400, 50, '拖拽橙色方块试试', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建可拖拽的方块
  const box = this.add.sprite(400, 300, 'orangeBox');
  
  // 保存初始位置
  const initialX = box.x;
  const initialY = box.y;

  // 设置为可交互和可拖拽
  box.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  box.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowBox');
    // 可选：添加缩放效果
    this.setScale(1.1);
  });

  // 监听拖拽中事件
  box.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  box.on('dragend', function(pointer) {
    // 恢复橙色
    this.setTexture('orangeBox');
    // 恢复原始缩放
    this.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加提示文本
  this.add.text(400, 500, '松开鼠标后方块会自动回到初始位置', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);