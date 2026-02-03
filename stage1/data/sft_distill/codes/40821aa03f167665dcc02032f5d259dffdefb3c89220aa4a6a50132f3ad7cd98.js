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
let graphics;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个更大的世界边界，让相机有足够的空间跟随
  this.physics.world.setBounds(0, 0, 800, 3000);
  
  // 使用 Graphics 绘制圆形并生成纹理
  graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建物理精灵对象，初始位置在屏幕中央
  player = this.physics.add.sprite(400, 300, 'playerCircle');
  
  // 设置精灵向下移动的速度
  player.setVelocityY(150);
  
  // 设置精灵的碰撞边界（可选，但有助于物理系统）
  player.setCollideWorldBounds(false); // 允许移出初始边界
  
  // 配置相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 800, 3000);
  
  // 添加一些参考网格线，帮助观察相机移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制水平参考线
  for (let y = 0; y <= 3000; y += 100) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(800, y);
  }
  
  // 绘制垂直参考线
  for (let x = 0; x <= 800; x += 100) {
    gridGraphics.moveTo(x, 0);
    gridGraphics.lineTo(x, 3000);
  }
  
  gridGraphics.strokePath();
  
  // 添加文本提示（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随圆形对象', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视口，不随世界滚动
  
  // 添加位置信息文本
  this.positionText = this.add.text(10, 50, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新位置信息显示
  this.positionText.setText(
    `圆形位置: (${Math.round(player.x)}, ${Math.round(player.y)})\n` +
    `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
  
  // 当圆形到达底部时，重置位置以便持续演示
  if (player.y > 2900) {
    player.setPosition(400, 100);
  }
}

// 创建游戏实例
new Phaser.Game(config);