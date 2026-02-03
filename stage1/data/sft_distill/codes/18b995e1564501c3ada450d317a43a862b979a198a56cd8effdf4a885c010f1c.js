const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let star;
const MOVE_SPEED = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createGrid.call(this);
  
  // 使用 Graphics 创建星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xff6600, 1);
  
  // 绘制星形（使用路径）
  const points = 5;
  const outerRadius = 30;
  const innerRadius = 15;
  const centerX = 40;
  const centerY = 40;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', 80, 80);
  graphics.destroy();
  
  // 创建星形精灵对象，初始位置在左上角
  star = this.add.sprite(100, 100, 'starTexture');
  
  // 设置相机跟随星形对象
  this.cameras.main.startFollow(star, true, 0.1, 0.1);
  
  // 设置相机边界，让相机可以在更大的世界中移动
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 添加提示文字（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随星形移动', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 让星形持续向右下移动
  if (star) {
    star.x += MOVE_SPEED;
    star.y += MOVE_SPEED;
    
    // 让星形旋转，增加视觉效果
    star.rotation += 0.02;
  }
}

// 辅助函数：创建网格背景
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  const gridSize = 100;
  const worldWidth = 2000;
  const worldHeight = 2000;
  
  // 绘制垂直线
  for (let x = 0; x <= worldWidth; x += gridSize) {
    graphics.lineBetween(x, 0, x, worldHeight);
  }
  
  // 绘制水平线
  for (let y = 0; y <= worldHeight; y += gridSize) {
    graphics.lineBetween(0, y, worldWidth, y);
  }
  
  // 在每个网格交点添加坐标标记
  const textStyle = {
    fontSize: '12px',
    color: '#00ff00',
    backgroundColor: '#000000'
  };
  
  for (let x = 0; x <= worldWidth; x += gridSize * 2) {
    for (let y = 0; y <= worldHeight; y += gridSize * 2) {
      this.add.text(x + 5, y + 5, `${x},${y}`, textStyle);
    }
  }
}

new Phaser.Game(config);