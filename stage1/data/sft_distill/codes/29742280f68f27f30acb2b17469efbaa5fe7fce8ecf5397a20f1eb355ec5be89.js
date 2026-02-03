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
  // 创建紫色菱形纹理
  const graphics = this.add.graphics();
  
  // 紫色菱形
  graphics.fillStyle(0x9b59b6, 1);
  const diamond = new Phaser.Geom.Polygon([
    { x: 50, y: 0 },    // 上顶点
    { x: 100, y: 50 },  // 右顶点
    { x: 50, y: 100 },  // 下顶点
    { x: 0, y: 50 }     // 左顶点
  ]);
  graphics.fillPoints(diamond.points, true);
  graphics.generateTexture('purpleDiamond', 100, 100);
  graphics.clear();
  
  // 拖拽时的橙色菱形
  graphics.fillStyle(0xe67e22, 1);
  graphics.fillPoints(diamond.points, true);
  graphics.generateTexture('orangeDiamond', 100, 100);
  graphics.destroy();
}

function create() {
  // 初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'purpleDiamond');
  
  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为橙色
    gameObject.setTexture('orangeDiamond');
    // 缩放效果
    gameObject.setScale(1.1);
  });
  
  // 拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新位置跟随鼠标
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复紫色
    gameObject.setTexture('purpleDiamond');
    // 恢复缩放
    gameObject.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 鼠标悬停效果
  diamond.on('pointerover', () => {
    if (!this.input.dragState) {
      diamond.setScale(1.05);
    }
  });
  
  diamond.on('pointerout', () => {
    if (!this.input.dragState) {
      diamond.setScale(1);
    }
  });
}

new Phaser.Game(config);