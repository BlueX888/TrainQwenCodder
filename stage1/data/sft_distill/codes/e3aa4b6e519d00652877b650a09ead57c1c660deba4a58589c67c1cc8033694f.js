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
let distanceText;

// 游戏状态信号
let gameState = {
  health: 100,
  score: 0,
  distance: 0,
  survivalTime: 0
};

const PLAYER_SPEED = 360 * 1.2; // 432
const ENEMY_SPEED = 360;

function preload() {
  // 使用 Graphics 生成纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x4444ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（灰色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x888888, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵（从随机边缘位置生成）
  const startX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
  const startY = Phaser.Math.Between(100, 500);
  enemy = this.physics.add.sprite(startX, startY, 'enemy');

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, hitEnemy, null, this);

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  distanceText = this.add.text(16, 45, '', {
    fontSize: '16px',
    fill: '#ffff00',
    fontFamily: 'Arial'
  });

  // 添加提示文本
  this.add.text(400, 30, '使用方向键移动躲避灰色敌人', {
    fontSize: '16px',
    fill: '#00ff00',
    fontFamily: 'Arial'
  }).setOrigin(0.5);

  // 添加边界视觉提示
  const bounds = this.add.graphics();
  bounds.lineStyle(2, 0x00ff00, 0.5);
  bounds.strokeRect(2, 2, 796, 596);
}

function update(time, delta) {
  // 更新生存时间
  gameState.survivalTime += delta / 1000;

  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  // 敌人追踪玩家
  if (gameState.health > 0) {
    this.physics.moveToObject(enemy, player, ENEMY_SPEED);
  } else {
    enemy.setVelocity(0);
  }

  // 计算玩家与敌人的距离
  gameState.distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 根据距离增加分数
  if (gameState.distance > 100 && gameState.health > 0) {
    gameState.score += delta * 0.01;
  }

  // 更新状态显示
  updateStatusDisplay();
}

function hitEnemy(player, enemy) {
  // 碰撞时减少生命值
  if (gameState.health > 0) {
    gameState.health -= 1;
    
    // 击退效果
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(
      Math.cos(angle) * PLAYER_SPEED * 1.5,
      Math.sin(angle) * PLAYER_SPEED * 1.5
    );

    // 生命值归零时游戏结束
    if (gameState.health <= 0) {
      gameState.health = 0;
      player.setTint(0xff0000);
    }
  }
}

function updateStatusDisplay() {
  const healthColor = gameState.health > 50 ? '#00ff00' : 
                      gameState.health > 20 ? '#ffff00' : '#ff0000';
  
  statusText.setText([
    `生命值: ${gameState.health.toFixed(0)}`,
    `分数: ${gameState.score.toFixed(0)}`,
    `生存时间: ${gameState.survivalTime.toFixed(1)}s`
  ]);
  statusText.setColor(healthColor);

  const distanceColor = gameState.distance > 200 ? '#00ff00' :
                        gameState.distance > 100 ? '#ffff00' : '#ff0000';
  
  distanceText.setText(`距离敌人: ${gameState.distance.toFixed(0)}px`);
  distanceText.setColor(distanceColor);

  // 游戏结束提示
  if (gameState.health <= 0) {
    if (!this.gameOverText) {
      this.gameOverText = this.add.text(400, 300, 'GAME OVER\n刷新页面重新开始', {
        fontSize: '32px',
        fill: '#ff0000',
        fontFamily: 'Arial',
        align: 'center'
      }).setOrigin(0.5);
    }
  }
}

const game = new Phaser.Game(config);