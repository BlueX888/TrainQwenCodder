const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形参数
  const hexRadius = 30;
  const hexCenterX = 40;
  const hexCenterY = 40;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexCenterX + hexRadius * Math.cos(angle);
    const y = hexCenterY + hexRadius * Math.sin(angle);
    
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
  graphics.generateTexture('hexagon', 80, 80);
  graphics.destroy();
  
  // 创建六边形精灵并设置在场景中心偏右下位置
  this.hexagon = this.physics.add.sprite(600, 400, 'hexagon');
  
  // 设置六边形向左上方移动（负x，负y方向）
  this.hexagon.setVelocity(-150, -150);
  
  // 扩大世界边界，让六边形有足够的移动空间
  this.physics.world.setBounds(-2000, -2000, 4000, 4000);
  this.hexagon.setCollideWorldBounds(false);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 相机跟随六边形，保持居中
  this.cameras.main.startFollow(this.hexagon, true, 0.1, 0.1);
  
  // 添加背景网格以便观察移动效果
  this.createGrid();
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随六边形中', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function createGrid() {
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格线
  const gridSize = 100;
  const worldSize = 4000;
  const offset = 2000;
  
  // 垂直线
  for (let x = -offset; x <= worldSize - offset; x += gridSize) {
    gridGraphics.lineBetween(x, -offset, x, worldSize - offset);
  }
  
  // 水平线
  for (let y = -offset; y <= worldSize - offset; y += gridSize) {
    gridGraphics.lineBetween(-offset, y, worldSize - offset, y);
  }
  
  // 绘制坐标轴（更明显）
  gridGraphics.lineStyle(2, 0x888888, 0.8);
  gridGraphics.lineBetween(-offset, 0, worldSize - offset, 0); // X轴
  gridGraphics.lineBetween(0, -offset, 0, worldSize - offset); // Y轴
}

function update(time, delta) {
  // 每帧更新逻辑（本例中六边形通过物理系统自动移动，无需手动更新）
}

// 创建游戏实例
new Phaser.Game(config);