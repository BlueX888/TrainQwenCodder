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
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  graphics.generateTexture('ellipse', 60, 60);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建物理精灵对象，初始位置在场景中心
  this.player = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置精灵向下移动的速度（每秒150像素）
  this.player.setVelocityY(150);

  // 扩展世界边界，让椭圆可以向下移动很远
  this.physics.world.setBounds(0, 0, 800, 3000);
  
  // 设置精灵的碰撞边界
  this.player.setCollideWorldBounds(false);

  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 800, 3000);
  
  // 相机跟随精灵对象，保持居中
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

  // 添加背景网格以便观察相机移动效果
  this.createBackgroundGrid();

  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随椭圆向下移动', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 如果椭圆移动到世界底部，重置到顶部
  if (this.player.y > 2900) {
    this.player.y = 100;
  }
}

// 辅助函数：创建背景网格以便观察相机移动
function createBackgroundGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x333333, 0.5);

  // 绘制水平线
  for (let y = 0; y < 3000; y += 100) {
    graphics.lineBetween(0, y, 800, y);
    
    // 每隔100像素添加坐标文本
    const coordText = this.add.text(10, y + 5, `Y: ${y}`, {
      fontSize: '12px',
      color: '#666666'
    });
  }

  // 绘制垂直线
  for (let x = 0; x < 800; x += 100) {
    graphics.lineBetween(x, 0, x, 3000);
  }

  graphics.setDepth(-1); // 放在最底层
}

// 创建并启动游戏
new Phaser.Game(config);