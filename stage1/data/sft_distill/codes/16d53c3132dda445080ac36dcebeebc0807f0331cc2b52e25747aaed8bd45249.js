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

// 全局信号对象
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  enemyX: 0,
  enemyY: 0,
  collisionCount: 0,
  distance: 0,
  gameTime: 0,
  playerSpeed: 96,
  enemySpeed: 80
};

let player;
let enemy;
let cursors;
let collisionCount = 0;

function preload() {
  // 使用 Graphics 生成纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（紫色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x9933ff, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 添加文本提示
  const infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setDepth(100);

  // 保存文本对象供 update 使用
  this.infoText = infoText;

  console.log(JSON.stringify({
    event: 'game_start',
    playerSpeed: 96,
    enemySpeed: 80,
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 重置玩家速度
  player.setVelocity(0);

  // 玩家移动控制（速度 96 = 80 * 1.2）
  const playerSpeed = 96;
  
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

  // 敌人追踪玩家（速度 80）
  const enemySpeed = 80;
  this.physics.moveToObject(enemy, player, enemySpeed);

  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 更新信号
  window.__signals__.playerX = Math.round(player.x);
  window.__signals__.playerY = Math.round(player.y);
  window.__signals__.enemyX = Math.round(enemy.x);
  window.__signals__.enemyY = Math.round(enemy.y);
  window.__signals__.distance = Math.round(distance);
  window.__signals__.gameTime = Math.round(time / 1000);
  window.__signals__.collisionCount = collisionCount;

  // 更新信息文本
  this.infoText.setText([
    `Player: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
    `Enemy: (${window.__signals__.enemyX}, ${window.__signals__.enemyY})`,
    `Distance: ${window.__signals__.distance}`,
    `Collisions: ${collisionCount}`,
    `Time: ${window.__signals__.gameTime}s`,
    `Player Speed: 96 | Enemy Speed: 80`,
    `Use Arrow Keys to Move`
  ]);
}

function handleCollision(player, enemy) {
  collisionCount++;
  
  // 输出碰撞日志
  console.log(JSON.stringify({
    event: 'collision',
    collisionCount: collisionCount,
    playerPos: { x: Math.round(player.x), y: Math.round(player.y) },
    enemyPos: { x: Math.round(enemy.x), y: Math.round(enemy.y) },
    timestamp: Date.now()
  }));

  // 重置敌人位置到随机边缘
  const edge = Phaser.Math.Between(0, 3);
  switch(edge) {
    case 0: // 上边
      enemy.setPosition(Phaser.Math.Between(50, 750), 50);
      break;
    case 1: // 右边
      enemy.setPosition(750, Phaser.Math.Between(50, 550));
      break;
    case 2: // 下边
      enemy.setPosition(Phaser.Math.Between(50, 750), 550);
      break;
    case 3: // 左边
      enemy.setPosition(50, Phaser.Math.Between(50, 550));
      break;
  }

  // 停止敌人速度，避免惯性
  enemy.setVelocity(0);
}

// 启动游戏
const game = new Phaser.Game(config);