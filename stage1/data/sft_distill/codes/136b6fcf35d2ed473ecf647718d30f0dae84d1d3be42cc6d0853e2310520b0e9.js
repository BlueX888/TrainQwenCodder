const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let hexagon;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建六边形纹理
  createHexagonTexture.call(this);
  
  // 绘制背景网格，便于观察相机移动
  createBackgroundGrid.call(this);
  
  // 创建六边形精灵并启用物理
  hexagon = this.physics.add.sprite(400, 500, 'hexagon');
  hexagon.setScale(1.5);
  
  // 设置六边形向上移动
  hexagon.setVelocityY(-150);
  
  // 相机跟随六边形
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 设置相机边界为更大的世界，允许相机移动
  this.cameras.main.setBounds(0, -2000, 800, 3000);
  this.physics.world.setBounds(0, -2000, 800, 3000);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随六边形向上移动', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 如果六边形移动到顶部，重置位置
  if (hexagon.y < -1900) {
    hexagon.setPosition(400, 500);
  }
}

// 创建六边形纹理
function createHexagonTexture() {
  const graphics = this.add.graphics();
  
  // 六边形参数
  const size = 30;
  const hexPoints = [];
  
  // 计算六边形的六个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = size + size * Math.cos(angle);
    const y = size + size * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.fillPoints(hexPoints, true);
  
  // 绘制边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', size * 2, size * 2);
  graphics.destroy();
}

// 创建背景网格
function createBackgroundGrid() {
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制更大范围的网格
  const gridSize = 50;
  const worldHeight = 3000;
  const worldWidth = 800;
  
  // 垂直线
  for (let x = 0; x <= worldWidth; x += gridSize) {
    gridGraphics.moveTo(x, -2000);
    gridGraphics.lineTo(x, 1000);
  }
  
  // 水平线
  for (let y = -2000; y <= 1000; y += gridSize) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(worldWidth, y);
  }
  
  gridGraphics.strokePath();
  
  // 添加坐标标记
  for (let y = -2000; y <= 1000; y += 200) {
    const marker = this.add.text(10, y, `Y: ${y}`, {
      fontSize: '14px',
      fill: '#666666'
    });
  }
}

// 创建游戏实例
new Phaser.Game(config);