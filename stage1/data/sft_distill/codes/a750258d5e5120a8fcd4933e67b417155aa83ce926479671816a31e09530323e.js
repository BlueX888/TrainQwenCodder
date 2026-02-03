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
let healthText;
let distanceText;
let gameOverText;

// 游戏状态变量（可验证信号）
let health = 100;
let isGameOver = false;

function preload() {
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
}

function create() {
  // 创建玩家精灵（中心位置）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建敌人精灵（随机位置）
  const startX = Phaser.Math.Between(50, 750);
  const startY = Phaser.Math.Between(50, 550);
  enemy = this.physics.add.sprite(startX, startY, 'enemy');
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, hitEnemy, null, this);
  
  // 创建UI文本
  healthText = this.add.text(16, 16, 'Health: 100', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  distanceText = this.add.text(16, 46, 'Distance: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  gameOverText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ff0000',
    fontStyle: 'bold'
  });
  gameOverText.setOrigin(0.5);
  
  // 添加提示文本
  const instructionText = this.add.text(400, 550, 'Use Arrow Keys to Move - Avoid the Gray Enemy!', {
    fontSize: '18px',
    fill: '#aaaaaa'
  });
  instructionText.setOrigin(0.5);
}

function update() {
  if (isGameOver) {
    player.setVelocity(0, 0);
    enemy.setVelocity(0, 0);
    return;
  }
  
  // 玩家移动控制（速度 96 = 80 * 1.2）
  const playerSpeed = 96;
  player.setVelocity(0, 0);
  
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
  
  // 计算并显示距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );
  distanceText.setText('Distance: ' + Math.floor(distance));
  
  // 更新生命值显示
  healthText.setText('Health: ' + health);
}

function hitEnemy(player, enemy) {
  if (isGameOver) return;
  
  // 减少生命值
  health -= 10;
  
  // 击退效果
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  player.setVelocity(
    Math.cos(angle) * 200,
    Math.sin(angle) * 200
  );
  
  // 检查游戏结束
  if (health <= 0) {
    health = 0;
    isGameOver = true;
    gameOverText.setText('GAME OVER!\nEnemy Caught You!');
    player.setTint(0xff0000);
  } else {
    // 短暂无敌效果（视觉反馈）
    player.setTint(0xff8888);
    this.time.delayedCall(200, () => {
      if (!isGameOver) {
        player.clearTint();
      }
    });
  }
}

new Phaser.Game(config);