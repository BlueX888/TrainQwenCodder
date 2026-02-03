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
let cursors;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，创建一个更大的游戏世界
  this.physics.world.setBounds(0, 0, 3200, 600);
  
  // 使用 Graphics 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建玩家精灵（在世界中间位置）
  player = this.physics.add.sprite(1600, 300, 'playerCircle');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许循环
  
  // 设置玩家向左移动
  player.setVelocityX(-150);
  
  // 设置相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3200, 600);
  
  // 添加一些参考网格线，帮助观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x555555, 0.5);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 3200; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 600; y += 100) {
    gridGraphics.lineBetween(0, y, 3200, y);
  }
  
  // 添加文字提示
  const text = this.add.text(16, 16, 'Camera follows the green circle\nCircle moves left automatically', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
  
  // 添加位置信息显示
  this.positionText = this.add.text(16, 100, '', {
    fontSize: '16px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新位置信息显示
  this.positionText.setText(
    `Player X: ${Math.round(player.x)}\n` +
    `Player Y: ${Math.round(player.y)}\n` +
    `Camera X: ${Math.round(this.cameras.main.scrollX)}`
  );
  
  // 当玩家移出左边界时，将其传送到右边界
  if (player.x < -25) {
    player.x = 3200 + 25;
  }
  
  // 当玩家移出右边界时，将其传送到左边界
  if (player.x > 3200 + 25) {
    player.x = -25;
  }
}

// 创建游戏实例
new Phaser.Game(config);