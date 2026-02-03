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
let enemy;
let cursors;
let statusText;
let gameState = {
  collisionCount: 0,
  survivalTime: 0,
  isAlive: true
};

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('playerTexture', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（灰色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x808080, 1);
  enemyGraphics.fillRect(0, 0, 32, 32);
  enemyGraphics.generateTexture('enemyTexture', 32, 32);
  enemyGraphics.destroy();

  // 创建玩家精灵（中心位置）
  player = this.physics.add.sprite(400, 300, 'playerTexture');
  player.setCollideWorldBounds(true);
  player.setBounce(0);

  // 创建敌人精灵（随机位置）
  const randomX = Phaser.Math.Between(50, 750);
  const randomY = Phaser.Math.Between(50, 550);
  enemy = this.physics.add.sprite(randomX, randomY, 'enemyTexture');
  enemy.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 更新状态文本
  updateStatusText();
}

function update(time, delta) {
  if (!gameState.isAlive) {
    return;
  }

  // 更新存活时间（秒）
  gameState.survivalTime += delta / 1000;

  // 玩家移动控制（速度 288 = 240 * 1.2）
  const playerSpeed = 240 * 1.2;
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(playerSpeed);
  }

  // 敌人追踪玩家（速度 240）
  const enemySpeed = 240;
  this.physics.moveToObject(enemy, player, enemySpeed);

  // 更新状态文本
  updateStatusText();
}

function handleCollision(player, enemy) {
  // 记录碰撞
  gameState.collisionCount++;
  
  // 碰撞后敌人短暂后退
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  enemy.setVelocity(
    -Math.cos(angle) * 300,
    -Math.sin(angle) * 300
  );
  
  // 0.5秒后恢复追踪
  setTimeout(() => {
    if (enemy && enemy.body) {
      enemy.setVelocity(0);
    }
  }, 500);
}

function updateStatusText() {
  statusText.setText([
    `存活时间: ${gameState.survivalTime.toFixed(1)}秒`,
    `碰撞次数: ${gameState.collisionCount}`,
    `玩家速度: 288 | 敌人速度: 240`,
    `提示: 使用方向键移动躲避灰色敌人`
  ]);
}

// 启动游戏
new Phaser.Game(config);