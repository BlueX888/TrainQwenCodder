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

// 状态变量
let player;
let enemies;
let cursors;
let trackingCount = 0; // 正在追踪玩家的敌人数量

const PATROL_SPEED = 160;
const CHASE_DISTANCE = 150; // 追踪距离阈值
const ENEMY_COUNT = 15;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建敌人组
  enemies = this.physics.add.group({
    key: 'enemy',
    repeat: ENEMY_COUNT - 1,
    setXY: {
      x: 100,
      y: 50,
      stepX: 0,
      stepY: 35
    }
  });

  // 配置每个敌人
  let index = 0;
  enemies.children.iterate((enemy) => {
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1, 0);
    
    // 设置初始位置（分散在场景中）
    const row = Math.floor(index / 5);
    const col = index % 5;
    enemy.setPosition(100 + col * 150, 80 + row * 150);
    
    // 随机初始巡逻方向
    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    enemy.setVelocityX(PATROL_SPEED * direction);
    
    // 自定义属性
    enemy.patrolDirection = direction;
    enemy.isChasing = false;
    
    index++;
  });

  // 添加碰撞检测（玩家与敌人）
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 添加状态文本
  this.statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  // 添加说明文本
  this.add.text(16, 550, 'Arrow keys to move. Avoid red enemies!', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update() {
  // 玩家控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  } else {
    player.setVelocityY(0);
  }

  // 重置追踪计数
  trackingCount = 0;

  // 敌人 AI
  enemies.children.iterate((enemy) => {
    const distance = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      enemy.x,
      enemy.y
    );

    if (distance < CHASE_DISTANCE) {
      // 追踪模式
      enemy.isChasing = true;
      trackingCount++;

      // 计算追踪方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        player.x,
        player.y
      );

      // 设置追踪速度
      this.physics.velocityFromRotation(angle, PATROL_SPEED, enemy.body.velocity);
      
      // 改变颜色表示追踪状态（变为深红色）
      enemy.setTint(0xff6666);
    } else {
      // 巡逻模式
      if (enemy.isChasing) {
        // 从追踪切换回巡逻
        enemy.isChasing = false;
        enemy.setVelocityY(0);
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
        enemy.clearTint();
      }

      // 检查是否碰到边界，反转方向
      if (enemy.body.blocked.left || enemy.body.blocked.right) {
        enemy.patrolDirection *= -1;
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }
    }
  });

  // 更新状态显示
  this.statusText.setText([
    `Enemies Tracking: ${trackingCount}/${ENEMY_COUNT}`,
    `Player Position: (${Math.floor(player.x)}, ${Math.floor(player.y)})`
  ]);
}

function hitEnemy(player, enemy) {
  // 玩家被敌人碰到，重置玩家位置
  player.setPosition(400, 300);
  player.setVelocity(0, 0);
  
  // 敌人恢复巡逻
  enemy.isChasing = false;
  enemy.setVelocityY(0);
  enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
  enemy.clearTint();
  
  // 可以在这里添加更多反馈，如闪烁效果
  this.cameras.main.shake(200, 0.01);
}

new Phaser.Game(config);