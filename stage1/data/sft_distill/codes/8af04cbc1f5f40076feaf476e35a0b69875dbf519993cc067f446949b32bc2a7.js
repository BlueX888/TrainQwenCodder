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

// 可验证状态信号
let sortCount = 0;
let objects = [];

function preload() {
  // 使用Graphics生成灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillRect(0, 0, 60, 60);
  graphics.lineStyle(2, 0x000000, 1);
  graphics.strokeRect(0, 0, 60, 60);
  graphics.generateTexture('grayBox', 60, 60);
  graphics.destroy();
}

function create() {
  // 创建标题文本
  this.add.text(400, 30, '拖拽灰色方块进行排序', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 显示排序次数
  const sortText = this.add.text(400, 60, '排序次数: 0', {
    fontSize: '18px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 创建20个灰色方块
  objects = [];
  const startX = 100;
  const startY = 120;
  const spacing = 24;

  for (let i = 0; i < 20; i++) {
    const x = startX + (i % 10) * 70;
    const y = startY + Math.floor(i / 10) * 90;
    
    const box = this.add.sprite(x, y, 'grayBox');
    box.setInteractive({ draggable: true });
    
    // 添加序号文本
    const text = this.add.text(x, y, (i + 1).toString(), {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 将文本关联到方块
    box.numberText = text;
    box.originalIndex = i;
    
    objects.push(box);
  }

  // 拖拽开始
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTint(0xffff00);
    gameObject.setDepth(1000);
    gameObject.numberText.setDepth(1001);
  });

  // 拖拽中
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
    gameObject.numberText.x = dragX;
    gameObject.numberText.y = dragY;
  });

  // 拖拽结束
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.clearTint();
    gameObject.setDepth(0);
    gameObject.numberText.setDepth(1);
    
    // 执行自动排序
    sortObjectsByY.call(this, sortText);
  });

  // 添加说明文本
  this.add.text(400, 570, '拖拽方块后松手，将按Y坐标自动排列', {
    fontSize: '14px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

function sortObjectsByY(sortText) {
  // 增加排序计数
  sortCount++;
  sortText.setText('排序次数: ' + sortCount);
  
  // 按Y坐标排序
  const sortedObjects = [...objects].sort((a, b) => a.y - b.y);
  
  // 计算新位置
  const startX = 100;
  const startY = 120;
  const cols = 10;
  const spacingX = 70;
  const spacingY = 90;
  
  sortedObjects.forEach((obj, index) => {
    const targetX = startX + (index % cols) * spacingX;
    const targetY = startY + Math.floor(index / cols) * spacingY;
    
    // 使用Tween动画移动到新位置
    this.tweens.add({
      targets: obj,
      x: targetX,
      y: targetY,
      duration: 300,
      ease: 'Power2'
    });
    
    // 同时移动文本
    this.tweens.add({
      targets: obj.numberText,
      x: targetX,
      y: targetY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 输出排序后的顺序到控制台（用于验证）
  console.log('排序次数:', sortCount);
  console.log('排序后顺序:', sortedObjects.map(obj => obj.originalIndex + 1));
}

const game = new Phaser.Game(config);