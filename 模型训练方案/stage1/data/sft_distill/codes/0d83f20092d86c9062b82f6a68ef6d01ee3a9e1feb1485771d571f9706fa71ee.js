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

// 游戏状态变量
let player;
let enemies;
let cursors;
let gameState = {
  trackingEnemies: 0,  // 正在追踪的敌人数量
  playerX: 0,
  playerY: 0,
  totalEnemies: 15
};

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（粉色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff69b4, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(32, 32);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成15个敌人，随机分布
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const enemy = enemies.create(x, y, 'enemy');
    
    // 设置敌人属性
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1, 1);
    
    // 自定义属性：巡逻模式
    enemy.patrolMinX = x - 100;
    enemy.patrolMaxX = x + 100;
    enemy.patrolSpeed = 300;
    enemy.isTracking = false;
    enemy.detectionRange = 150; // 检测范围
    
    // 初始随机方向巡逻
    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    enemy.body.setVelocityX(direction * enemy.patrolSpeed);
  }

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文本显示状态
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update(time, delta) {
  // 玩家移动控制
  const playerSpeed = 200;
  player.body.setVelocity(0);

  if (cursors.left.isDown) {
    player.body.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(playerSpeed);
  }

  if (cursors.up.isDown) {
    player.body.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(playerSpeed);
  }

  // 更新游戏状态
  gameState.playerX = Math.round(player.x);
  gameState.playerY = Math.round(player.y);
  gameState.trackingEnemies = 0;

  // 敌人AI逻辑
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 判断是否进入追踪模式
    if (distance < enemy.detectionRange) {
      // 追踪模式
      enemy.isTracking = true;
      gameState.trackingEnemies++;

      // 计算追踪方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );

      // 设置追踪速度
      enemy.body.setVelocity(
        Math.cos(angle) * enemy.patrolSpeed,
        Math.sin(angle) * enemy.patrolSpeed
      );

    } else {
      // 巡逻模式
      if (enemy.isTracking) {
        // 从追踪模式切换回巡逻模式
        enemy.isTracking = false;
        enemy.body.setVelocityY(0);
        const direction = enemy.x < player.x ? 1 : -1;
        enemy.body.setVelocityX(direction * enemy.patrolSpeed);
      }

      // 巡逻边界检测
      if (enemy.x <= enemy.patrolMinX && enemy.body.velocity.x < 0) {
        enemy.body.setVelocityX(enemy.patrolSpeed);
      } else if (enemy.x >= enemy.patrolMaxX && enemy.body.velocity.x > 0) {
        enemy.body.setVelocityX(-enemy.patrolSpeed);
      }

      // 保持巡逻速度恒定
      if (!enemy.isTracking && enemy.body.velocity.y === 0) {
        const currentSpeed = Math.abs(enemy.body.velocity.x);
        if (currentSpeed < enemy.patrolSpeed * 0.9) {
          const direction = enemy.body.velocity.x >= 0 ? 1 : -1;
          enemy.body.setVelocityX(direction * enemy.patrolSpeed);
        }
      }
    }
  });

  // 更新状态显示
  this.statusText.setText([
    `Player: (${gameState.playerX}, ${gameState.playerY})`,
    `Tracking Enemies: ${gameState.trackingEnemies}/${gameState.totalEnemies}`,
    `Use Arrow Keys to Move`
  ]);
}

// 启动游戏
new Phaser.Game(config);