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

let player;
let cursors;
let crossCount = 0; // 穿越边界计数器（状态验证信号）
let statusText;

function preload() {
  // 使用 Graphics 创建青色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建青色玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  statusText = this.add.text(10, 10, 'Cross Count: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 添加操作提示
  this.add.text(10, 50, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#00ffff'
  });
  
  // 添加边界参考线
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x00ff00, 0.3);
  graphics.strokeRect(0, 0, config.width, config.height);
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  // 方向键控制移动
  if (cursors.left.isDown) {
    player.setVelocityX(-120);
  } else if (cursors.right.isDown) {
    player.setVelocityX(120);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-120);
  } else if (cursors.down.isDown) {
    player.setVelocityY(120);
  }
  
  // 处理对角线移动时的速度归一化
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    const velocity = player.body.velocity;
    velocity.normalize().scale(120);
  }
  
  // 边界循环逻辑
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  // 左右边界循环
  if (player.x < -halfWidth) {
    player.x = config.width + halfWidth;
    crossCount++;
    updateStatus();
  } else if (player.x > config.width + halfWidth) {
    player.x = -halfWidth;
    crossCount++;
    updateStatus();
  }
  
  // 上下边界循环
  if (player.y < -halfHeight) {
    player.y = config.height + halfHeight;
    crossCount++;
    updateStatus();
  } else if (player.y > config.height + halfHeight) {
    player.y = -halfHeight;
    crossCount++;
    updateStatus();
  }
}

function updateStatus() {
  statusText.setText('Cross Count: ' + crossCount);
}

new Phaser.Game(config);