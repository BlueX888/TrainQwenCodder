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
  // 创建大场景的背景网格
  const graphics = this.add.graphics();
  
  // 绘制网格背景 (1600x1200)
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制垂直线
  for (let x = 0; x <= 1600; x += 100) {
    graphics.lineBetween(x, 0, x, 1200);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 1200; y += 100) {
    graphics.lineBetween(0, y, 1600, y);
  }
  
  // 绘制场景边界（红色粗线）
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.strokeRect(0, 0, 1600, 1200);
  
  // 添加四个角的标记
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(0, 0, 10);           // 左上角
  graphics.fillCircle(1600, 0, 10);        // 右上角
  graphics.fillCircle(0, 1200, 10);        // 左下角
  graphics.fillCircle(1600, 1200, 10);     // 右下角
  
  // 添加中心标记
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(800, 600, 15);
  
  // 创建玩家纹理（使用Graphics生成）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ffff, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
  
  // 创建玩家精灵
  player = this.physics.add.sprite(800, 600, 'player');
  player.setCollideWorldBounds(false); // 不限制玩家移动，只限制相机
  
  // 设置世界边界（与场景大小一致）
  this.physics.world.setBounds(0, 0, 1600, 1200);
  
  // 关键：设置相机边界
  this.cameras.main.setBounds(0, 0, 1600, 1200);
  
  // 让相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 设置相机缩放（可选，让效果更明显）
  this.cameras.main.setZoom(1);
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加文本说明
  const instructions = this.add.text(10, 10, 
    'Use Arrow Keys to Move\nCamera is bounded to 1600x1200\nRed borders mark scene limits', 
    {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    }
  );
  instructions.setScrollFactor(0); // 固定在屏幕上
  
  // 添加坐标显示
  this.coordsText = this.add.text(10, 100, '', {
    fontSize: '14px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  });
  this.coordsText.setScrollFactor(0);
}

function update() {
  // 玩家移动控制
  const speed = 300;
  
  player.setVelocity(0);
  
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  }
  
  // 更新坐标显示
  this.coordsText.setText(
    `Player: (${Math.round(player.x)}, ${Math.round(player.y)})\n` +
    `Camera: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
}

// 启动游戏
new Phaser.Game(config);