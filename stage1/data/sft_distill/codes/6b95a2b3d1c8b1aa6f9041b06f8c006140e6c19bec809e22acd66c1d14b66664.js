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
let statusText;

// 状态信号
let gameState = {
  enemiesChasing: 0,  // 正在追踪的敌人数量
  playerHealth: 100,
  detectionRange: 150 // 检测范围
};

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（黄色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xffff00, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成5个敌人，分布在不同位置
  const enemyPositions = [
    { x: 150, y: 150 },
    { x: 650, y: 150 },
    { x: 200, y: 450 },
    { x: 600, y: 450 },
    { x: 400, y: 100 }
  ];

  enemyPositions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0);
    
    // 自定义属性：巡逻状态
    enemy.patrolSpeed = 80;
    enemy.patrolDirection = Math.random() > 0.5 ? 1 : -1; // 随机初始方向
    enemy.patrolMinX = pos.x - 150; // 巡逻左边界
    enemy.patrolMaxX = pos.x + 150; // 巡逻右边界
    enemy.isChasing = false;
    
    // 设置初始速度
    enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
  });

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setDepth(100);

  // 添加碰撞检测（可选：敌人碰到玩家减血）
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);
}

function update(time, delta) {
  // 玩家控制
  const speed = 200;
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

  // 重置追踪计数
  gameState.enemiesChasing = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 检测玩家是否在范围内
    if (distance < gameState.detectionRange) {
      // 追踪模式
      enemy.isChasing = true;
      gameState.enemiesChasing++;

      // 计算追踪方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );

      // 设置追踪速度
      const chaseSpeed = enemy.patrolSpeed * 1.2; // 追踪时稍快
      enemy.setVelocity(
        Math.cos(angle) * chaseSpeed,
        Math.sin(angle) * chaseSpeed
      );

      // 改变颜色表示追踪状态（橙色）
      enemy.setTint(0xff8800);
    } else {
      // 巡逻模式
      if (enemy.isChasing) {
        // 从追踪切换回巡逻，恢复颜色
        enemy.clearTint();
        enemy.isChasing = false;
      }

      // 巡逻逻辑：左右往返
      if (enemy.x <= enemy.patrolMinX) {
        enemy.patrolDirection = 1; // 向右
        enemy.setVelocityX(enemy.patrolSpeed);
        enemy.setVelocityY(0);
      } else if (enemy.x >= enemy.patrolMaxX) {
        enemy.patrolDirection = -1; // 向左
        enemy.setVelocityX(-enemy.patrolSpeed);
        enemy.setVelocityY(0);
      } else {
        // 保持当前巡逻方向
        enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        enemy.setVelocityY(0);
      }
    }
  });

  // 更新状态显示
  updateStatusText();
}

function hitEnemy(player, enemy) {
  // 碰撞效果：减少玩家生命值（每秒最多减1次）
  if (!enemy.lastHitTime || time - enemy.lastHitTime > 1000) {
    gameState.playerHealth = Math.max(0, gameState.playerHealth - 10);
    enemy.lastHitTime = time;
    
    // 视觉反馈
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      player.clearTint();
    });
  }
}

function updateStatusText() {
  statusText.setText([
    `Player Health: ${gameState.playerHealth}`,
    `Enemies Chasing: ${gameState.enemiesChasing}/5`,
    `Detection Range: ${gameState.detectionRange}px`,
    `Use Arrow Keys to Move`
  ]);
}

new Phaser.Game(config);