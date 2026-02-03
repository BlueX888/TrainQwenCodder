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
  // 设置世界边界为更大的区域，允许对象移动
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  graphics.generateTexture('ellipse', 60, 60);
  graphics.destroy();
  
  // 创建物理精灵对象，初始位置在世界中心
  this.player = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置向右上方移动的速度
  // velocityX: 150 (向右)，velocityY: -100 (向上)
  this.player.setVelocity(150, -100);
  
  // 设置精灵的碰撞边界
  this.player.setCollideWorldBounds(false);
  
  // 配置主相机跟随该对象
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3000, 3000);
  
  // 添加背景网格以便观察移动效果
  this.createGrid();
  
  // 添加文字提示
  const text = this.add.text(10, 10, '相机跟随椭圆移动', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 可选：当对象移出世界边界时重置位置
  if (this.player.x > 2900 || this.player.y < 100) {
    this.player.setPosition(400, 300);
  }
}

// 辅助函数：创建背景网格以便观察移动
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x333333, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 3000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 3000);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 3000; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(3000, y);
  }
  
  graphics.strokePath();
}

new Phaser.Game(config);