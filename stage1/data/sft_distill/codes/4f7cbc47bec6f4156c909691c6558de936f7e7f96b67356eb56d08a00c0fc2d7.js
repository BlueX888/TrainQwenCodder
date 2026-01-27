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

let player;

function preload() {
  // 使用 Graphics 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建一个更大的世界边界，让对象可以移动
  this.physics.world.setBounds(0, 0, 3000, 600);
  
  // 创建玩家精灵（圆形）
  player = this.physics.add.sprite(100, 300, 'circle');
  player.setCollideWorldBounds(false); // 允许移动到世界边界之外
  
  // 设置初始速度，使其自动向右移动
  player.setVelocityX(150);
  
  // 设置相机边界（与世界边界一致）
  this.cameras.main.setBounds(0, 0, 3000, 600);
  
  // 让相机跟随玩家，并保持居中
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 可选：设置相机跟随偏移，使对象完全居中
  this.cameras.main.setFollowOffset(0, 0);
  
  // 添加背景网格以便观察移动效果
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 3000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 600);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 600; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(3000, y);
  }
  
  graphics.strokePath();
  
  // 添加文本提示
  const text = this.add.text(16, 16, 'Camera follows the green circle', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 让文本固定在相机上，不随场景滚动
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 保持对象持续向右移动
  // 如果速度因碰撞或其他原因改变，可以在这里重新设置
  if (player.body.velocity.x < 150) {
    player.setVelocityX(150);
  }
  
  // 可选：当对象到达世界边界时，重置位置
  if (player.x > 2900) {
    player.setPosition(100, 300);
  }
}

// 创建游戏实例
new Phaser.Game(config);