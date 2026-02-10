const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let hexagon;
const MOVE_SPEED = 100; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 创建六边形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  const hexRadius = 30;
  const hexPath = [];
  
  // 计算六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexPath.push(new Phaser.Math.Vector2(x, y));
  }
  
  graphics.fillPoints(hexPath, true);
  graphics.strokePoints(hexPath, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
}

function create() {
  // 创建一个更大的世界边界，让六边形可以移动
  const worldWidth = 3000;
  const worldHeight = 600;
  this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
  
  // 创建六边形精灵
  hexagon = this.add.sprite(100, 300, 'hexagon');
  
  // 设置相机边界（与世界边界一致）
  this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
  
  // 让相机跟随六边形
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 添加背景网格以便观察相机移动
  this.createGrid(worldWidth, worldHeight);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '六边形自动向右移动，相机跟随', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界滚动
}

function update(time, delta) {
  // 让六边形自动向右移动
  const moveDistance = MOVE_SPEED * (delta / 1000);
  hexagon.x += moveDistance;
  
  // 当六边形到达世界边界时，重置位置
  if (hexagon.x > 2900) {
    hexagon.x = 100;
  }
  
  // 添加轻微的上下浮动效果
  hexagon.y = 300 + Math.sin(time / 500) * 50;
}

// 辅助函数：创建背景网格
Phaser.Scene.prototype.createGrid = function(width, height) {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  const gridSize = 100;
  
  // 绘制垂直线
  for (let x = 0; x <= width; x += gridSize) {
    graphics.lineBetween(x, 0, x, height);
  }
  
  // 绘制水平线
  for (let y = 0; y <= height; y += gridSize) {
    graphics.lineBetween(0, y, width, y);
  }
  
  // 添加坐标标记
  for (let x = 0; x <= width; x += gridSize * 2) {
    const label = this.add.text(x + 5, 5, `${x}`, {
      fontSize: '12px',
      color: '#888888'
    });
  }
};

// 启动游戏
new Phaser.Game(config);