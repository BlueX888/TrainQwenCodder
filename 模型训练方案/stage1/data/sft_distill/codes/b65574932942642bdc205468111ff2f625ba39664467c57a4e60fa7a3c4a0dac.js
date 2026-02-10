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
let signals = {
  enemyStates: [],
  playerPosition: { x: 0, y: 0 },
  frame: 0
};

// 全局暴露 signals 用于验证
window.__signals__ = signals;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x3498db, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（粉色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff69b4, 1);
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

  // 生成10个敌人，分布在不同位置
  const positions = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 100, y: 500 },
    { x: 700, y: 500 },
    { x: 200, y: 200 },
    { x: 600, y: 200 },
    { x: 200, y: 400 },
    { x: 600, y: 400 },
    { x: 400, y: 100 },
    { x: 400, y: 500 }
  ];

  positions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0);
    
    // 设置初始巡逻方向（奇数向右，偶数向左）
    enemy.patrolDirection = index % 2 === 0 ? 1 : -1;
    enemy.setVelocityX(160 * enemy.patrolDirection);
    
    // 标记敌人状态
    enemy.isChasing = false;
    enemy.enemyId = index;
  });

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文字提示
  this.add.text(10, 10, 'Arrow keys to move\nEnemies chase when close', {
    fontSize: '16px',
    fill: '#fff'
  });
}

function update(time, delta) {
  // 更新帧计数
  signals.frame++;

  // 玩家移动控制
  const playerSpeed = 200;
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

  // 更新玩家位置信号
  signals.playerPosition.x = Math.round(player.x);
  signals.playerPosition.y = Math.round(player.y);

  // 清空敌人状态数组
  signals.enemyStates = [];

  // 敌人AI逻辑
  const chaseDistance = 150; // 追踪距离阈值
  const chaseSpeed = 160;
  const patrolSpeed = 160;

  enemies.children.entries.forEach((enemy) => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    let state = 'patrol';

    // 如果玩家在追踪范围内
    if (distance < chaseDistance) {
      enemy.isChasing = true;
      state = 'chasing';

      // 计算朝向玩家的方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );

      // 设置追踪速度
      enemy.setVelocity(
        Math.cos(angle) * chaseSpeed,
        Math.sin(angle) * chaseSpeed
      );
    } else {
      // 恢复巡逻模式
      if (enemy.isChasing) {
        enemy.isChasing = false;
        enemy.setVelocityY(0);
        enemy.setVelocityX(patrolSpeed * enemy.patrolDirection);
      }

      // 巡逻边界检测与反向
      if (enemy.x <= 16 && enemy.body.velocity.x < 0) {
        enemy.patrolDirection = 1;
        enemy.setVelocityX(patrolSpeed);
      } else if (enemy.x >= 784 && enemy.body.velocity.x > 0) {
        enemy.patrolDirection = -1;
        enemy.setVelocityX(-patrolSpeed);
      }
    }

    // 记录敌人状态到 signals
    signals.enemyStates.push({
      id: enemy.enemyId,
      x: Math.round(enemy.x),
      y: Math.round(enemy.y),
      state: state,
      distance: Math.round(distance),
      velocityX: Math.round(enemy.body.velocity.x),
      velocityY: Math.round(enemy.body.velocity.y)
    });
  });

  // 每60帧输出一次日志（约1秒）
  if (signals.frame % 60 === 0) {
    console.log(JSON.stringify({
      frame: signals.frame,
      player: signals.playerPosition,
      enemies: signals.enemyStates.map(e => ({
        id: e.id,
        state: e.state,
        distance: e.distance
      }))
    }));
  }
}

new Phaser.Game(config);