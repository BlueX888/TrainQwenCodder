const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 记录菱形的初始位置
  const startX = 400;
  const startY = 300;
  const diamondSize = 80;

  // 创建灰色菱形纹理
  const grayGraphics = this.add.graphics();
  grayGraphics.fillStyle(0x888888, 1);
  grayGraphics.beginPath();
  grayGraphics.moveTo(diamondSize / 2, 0);
  grayGraphics.lineTo(diamondSize, diamondSize / 2);
  grayGraphics.lineTo(diamondSize / 2, diamondSize);
  grayGraphics.lineTo(0, diamondSize / 2);
  grayGraphics.closePath();
  grayGraphics.fillPath();
  grayGraphics.generateTexture('diamondGray', diamondSize, diamondSize);
  grayGraphics.destroy();

  // 创建红色菱形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff4444, 1);
  redGraphics.beginPath();
  redGraphics.moveTo(diamondSize / 2, 0);
  redGraphics.lineTo(diamondSize, diamondSize / 2);
  redGraphics.lineTo(diamondSize / 2, diamondSize);
  redGraphics.lineTo(0, diamondSize / 2);
  redGraphics.closePath();
  redGraphics.fillPath();
  redGraphics.generateTexture('diamondRed', diamondSize, diamondSize);
  redGraphics.destroy();

  // 创建菱形精灵
  const diamond = this.add.sprite(startX, startY, 'diamondGray');

  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  diamond.on('dragstart', (pointer) => {
    // 改变为红色
    diamond.setTexture('diamondRed');
  });

  // 监听拖拽事件
  diamond.on('drag', (pointer, dragX, dragY) => {
    // 更新菱形位置到拖拽位置
    diamond.x = dragX;
    diamond.y = dragY;
  });

  // 监听拖拽结束事件
  diamond.on('dragend', (pointer) => {
    // 改回灰色
    diamond.setTexture('diamondGray');
    
    // 回到初始位置
    diamond.x = startX;
    diamond.y = startY;
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);