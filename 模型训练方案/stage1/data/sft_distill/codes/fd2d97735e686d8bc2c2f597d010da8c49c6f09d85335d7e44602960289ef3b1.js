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

let diamond;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createGrid.call(this);
  
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1);
  graphics.strokeStyle(0xffffff, 2);
  
  // 绘制菱形（中心点在 32, 32）
  graphics.beginPath();
  graphics.moveTo(32, 8);      // 上顶点
  graphics.lineTo(56, 32);     // 右顶点
  graphics.lineTo(32, 56);     // 下顶点
  graphics.lineTo(8, 32);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵并启用物理
  diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置菱形向右移动
  diamond.setVelocityX(150);
  
  // 设置世界边界（扩大场景范围）
  this.physics.world.setBounds(0, 0, 3000, 600);
  
  // 设置相机边界
  this.cameras.main.setBounds(0, 0, 3000, 600);
  
  // 相机跟随菱形对象
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(16, 16, '相机跟随菱形移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上不滚动
  
  // 添加坐标显示
  this.coordinatesText = this.add.text(16, 50, '', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordinatesText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新坐标显示
  if (diamond && this.coordinatesText) {
    this.coordinatesText.setText(
      `菱形位置: (${Math.round(diamond.x)}, ${Math.round(diamond.y)})\n` +
      `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
    );
  }
  
  // 当菱形到达边界时，重置位置
  if (diamond && diamond.x > 2900) {
    diamond.setPosition(100, 300);
  }
}

// 辅助函数：创建网格背景
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineTo(x, 0);
    graphics.lineTo(x, 600);
    graphics.moveTo(x + 100, 0);
  }
  
  // 绘制水平线
  graphics.moveTo(0, 0);
  for (let y = 0; y <= 600; y += 100) {
    graphics.lineTo(0, y);
    graphics.lineTo(3000, y);
    graphics.moveTo(0, y + 100);
  }
  
  graphics.strokePath();
  
  // 添加坐标标记
  for (let x = 0; x <= 3000; x += 200) {
    const marker = this.add.text(x + 5, 5, `${x}`, {
      fontSize: '12px',
      color: '#888888'
    });
  }
}

// 启动游戏
new Phaser.Game(config);