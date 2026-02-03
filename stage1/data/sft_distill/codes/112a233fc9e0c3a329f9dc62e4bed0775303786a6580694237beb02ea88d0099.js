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
const PATROL_SPEED = 240;
const CHASE_DISTANCE = 150;
const ENEMY_COUNT = 8;

// 可验证的状态信号
window.__signals__ = {
  enemiesPatrolling: 0,
  enemiesChasing: 0,
  playerPosition: { x: 0, y: 0 },
  enemyStates: []
};

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（绿色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ff00, 1);
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

  // 生成8个敌人，分布在不同位置
  const positions = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 100, y: 500 },
    { x: 700, y: 500 },
    { x: 200, y: 250 },
    { x: 600, y: 250 },
    { x: 200, y: 450 },
    { x: 600, y: 450 }
  ];

  for (let i = 0; i < ENEMY_COUNT; i++) {
    const enemy = enemies.create(positions[i].x, positions[i].y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1, 1);
    
    // 自定义数据：巡逻状态和初始方向
    enemy.setData('state', 'patrol'); // 'patrol' 或 'chase'
    enemy.setData('patrolDirection', i % 2 === 0 ? 1 : -1); // 左右交替
    
    // 设置初始巡逻速度
    enemy.setVelocityX(PATROL_SPEED * enemy.getData('patrolDirection'));
  }

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文字
  this.add.text(10, 10, 'Arrow Keys: Move Player\nGreen: Patrol | Bright Green: Chasing', {
    fontSize: '14px',
    fill: '#ffffff'
  });

  // 显示状态信息
  this.statusText = this.add.text(10, 560, '', {
    fontSize: '14px',
    fill: '#ffff00'
  });
}

function update(time, delta) {
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

  // 更新敌人行为
  let patrolCount = 0;
  let chaseCount = 0;
  const enemyStates = [];

  enemies.children.entries.forEach((enemy, index) => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    const currentState = enemy.getData('state');
    let newState = currentState;

    // 根据距离决定状态
    if (distance < CHASE_DISTANCE) {
      newState = 'chase';
    } else {
      newState = 'patrol';
    }

    // 状态切换
    if (newState !== currentState) {
      enemy.setData('state', newState);
    }

    // 执行对应行为
    if (newState === 'chase') {
      // 追踪模式：朝向玩家移动
      chaseCount++;
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
      enemy.setVelocity(
        Math.cos(angle) * PATROL_SPEED,
        Math.sin(angle) * PATROL_SPEED
      );
      // 高亮显示追踪状态
      enemy.setTint(0x88ff88);
    } else {
      // 巡逻模式：左右往返
      patrolCount++;
      const patrolDirection = enemy.getData('patrolDirection');
      
      // 检测边界反转
      if (enemy.x <= 16 && patrolDirection === -1) {
        enemy.setData('patrolDirection', 1);
        enemy.setVelocityX(PATROL_SPEED);
        enemy.setVelocityY(0);
      } else if (enemy.x >= 784 && patrolDirection === 1) {
        enemy.setData('patrolDirection', -1);
        enemy.setVelocityX(-PATROL_SPEED);
        enemy.setVelocityY(0);
      } else {
        // 保持巡逻速度
        enemy.setVelocityX(PATROL_SPEED * enemy.getData('patrolDirection'));
        enemy.setVelocityY(0);
      }
      
      // 清除高亮
      enemy.clearTint();
    }

    // 记录敌人状态
    enemyStates.push({
      index: index,
      state: newState,
      position: { x: Math.round(enemy.x), y: Math.round(enemy.y) },
      distance: Math.round(distance)
    });
  });

  // 更新全局信号
  window.__signals__.enemiesPatrolling = patrolCount;
  window.__signals__.enemiesChasing = chaseCount;
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };
  window.__signals__.enemyStates = enemyStates;

  // 更新状态显示
  this.statusText.setText(
    `Patrolling: ${patrolCount} | Chasing: ${chaseCount}`
  );

  // 输出日志（每60帧输出一次，避免刷屏）
  if (time % 1000 < 16) {
    console.log(JSON.stringify({
      timestamp: Math.round(time),
      patrolling: patrolCount,
      chasing: chaseCount,
      playerPos: window.__signals__.playerPosition
    }));
  }
}

new Phaser.Game(config);