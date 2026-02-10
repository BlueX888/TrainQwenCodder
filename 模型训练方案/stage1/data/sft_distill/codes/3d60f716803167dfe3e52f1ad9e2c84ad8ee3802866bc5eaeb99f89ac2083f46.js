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
let enemies;
let cursors;
let gameState = {
  enemiesPatrolling: 5,
  enemiesChasing: 0,
  playerSpeed: 200
};
let statusText;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（紫色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x9933ff, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人物理组
  enemies = this.physics.add.group();

  // 创建5个敌人，分布在不同位置
  const enemyPositions = [
    { x: 100, y: 100 },
    { x: 700, y: 150 },
    { x: 200, y: 400 },
    { x: 600, y: 450 },
    { x: 400, y: 500 }
  ];

  enemyPositions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0);
    
    // 自定义属性：巡逻状态
    enemy.patrolSpeed = 120;
    enemy.chaseSpeed = 180;
    enemy.detectionRange = 150;
    enemy.isChasing = false;
    enemy.patrolDirection = index % 2 === 0 ? 1 : -1; // 交替初始方向
    enemy.patrolMinX = pos.x - 100;
    enemy.patrolMaxX = pos.x + 100;
    
    // 设置初始巡逻速度
    enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
  });

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 说明文字
  this.add.text(16, 560, '使用方向键移动 | 紫色敌人会在巡逻和追踪间切换', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-gameState.playerSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(gameState.playerSpeed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-gameState.playerSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(gameState.playerSpeed);
  }

  // 重置追踪计数
  gameState.enemiesChasing = 0;
  gameState.enemiesPatrolling = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 检测是否应该追踪玩家
    if (distance < enemy.detectionRange) {
      // 追踪模式
      if (!enemy.isChasing) {
        enemy.isChasing = true;
        enemy.setTint(0xff6666); // 变红表示追踪
      }

      // 计算追踪方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );

      enemy.setVelocity(
        Math.cos(angle) * enemy.chaseSpeed,
        Math.sin(angle) * enemy.chaseSpeed
      );

      gameState.enemiesChasing++;
    } else {
      // 巡逻模式
      if (enemy.isChasing) {
        enemy.isChasing = false;
        enemy.clearTint(); // 恢复原色
        // 重新设置巡逻速度
        enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        enemy.setVelocityY(0);
      }

      // 巡逻边界检测
      if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
        enemy.patrolDirection = 1;
        enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
      } else if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
        enemy.patrolDirection = -1;
        enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
      }

      // 世界边界检测（额外保护）
      if (enemy.x <= 16 || enemy.x >= 784) {
        enemy.patrolDirection *= -1;
        enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
      }

      gameState.enemiesPatrolling++;
    }
  });

  // 更新状态文本
  statusText.setText([
    `巡逻中: ${gameState.enemiesPatrolling}`,
    `追踪中: ${gameState.enemiesChasing}`,
    `玩家位置: (${Math.floor(player.x)}, ${Math.floor(player.y)})`
  ]);
}

new Phaser.Game(config);