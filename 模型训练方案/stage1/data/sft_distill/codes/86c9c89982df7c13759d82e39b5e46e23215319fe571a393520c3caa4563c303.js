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

let player;
let cursors;
let playerX = 0;
let playerY = 0;
let wrapCount = 0; // 状态信号：记录循环次数

function preload() {
  // 使用 Graphics 创建黄色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFFF00, 1); // 黄色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵在屏幕中央
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 初始化状态变量
  playerX = player.x;
  playerY = player.y;
  
  // 添加文本显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });
  
  updateStatusText.call(this);
}

function update() {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 处理键盘输入
  if (cursors.left.isDown) {
    player.setVelocityX(-240);
  } else if (cursors.right.isDown) {
    player.setVelocityX(240);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-240);
  } else if (cursors.down.isDown) {
    player.setVelocityY(240);
  }
  
  // 处理对角线移动时的速度归一化
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    const normalizedSpeed = 240 / Math.sqrt(2);
    player.setVelocity(
      player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
      player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
    );
  }
  
  // 循环地图效果：检测边界并从对侧出现
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  // 左右边界循环
  if (player.x < -halfWidth) {
    player.x = config.width + halfWidth;
    wrapCount++;
  } else if (player.x > config.width + halfWidth) {
    player.x = -halfWidth;
    wrapCount++;
  }
  
  // 上下边界循环
  if (player.y < -halfHeight) {
    player.y = config.height + halfHeight;
    wrapCount++;
  } else if (player.y > config.height + halfHeight) {
    player.y = -halfHeight;
    wrapCount++;
  }
  
  // 更新状态变量
  playerX = Math.round(player.x);
  playerY = Math.round(player.y);
  
  updateStatusText.call(this);
}

function updateStatusText() {
  this.statusText.setText([
    `Position: (${playerX}, ${playerY})`,
    `Wrap Count: ${wrapCount}`,
    `Speed: 240`,
    `Use Arrow Keys to Move`
  ]);
}

new Phaser.Game(config);