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

// 全局状态信号
window.__signals__ = {
  enemiesPatrolling: 0,
  enemiesChasing: 0,
  playerPosition: { x: 0, y: 0 },
  enemyStates: []
};

let player;
let enemies;
let cursors;
const PATROL_SPEED = 80;
const CHASE_SPEED = 100;
const CHASE_DISTANCE = 150;
const PATROL_RANGE = 100;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（蓝色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x0088ff, 1);
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
    { x: 200, y: 400 },
    { x: 600, y: 400 }
  ];

  positions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0);
    
    // 自定义属性
    enemy.patrolStartX = pos.x;
    enemy.patrolDirection = index % 2 === 0 ? 1 : -1; // 交替初始方向
    enemy.state = 'patrol'; // patrol 或 chase
    enemy.enemyId = index;
    
    // 设置初始巡逻速度
    enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
  });

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  this.add.text(10, 10, 'Arrow keys to move\nBlue enemies patrol and chase', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 状态显示文本
  this.statusText = this.add.text(10, 550, '', {
    fontSize: '14px',
    fill: '#ffff00'
  });
}

function update(time, delta) {
  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  }

  // 更新敌人行为
  let patrolCount = 0;
  let chaseCount = 0;
  const enemyStates = [];

  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 判断是否切换状态
    if (distance < CHASE_DISTANCE) {
      // 追踪模式
      if (enemy.state !== 'chase') {
        enemy.state = 'chase';
        enemy.setTint(0xff4444); // 追踪时变红色调
      }

      // 计算朝向玩家的方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );

      enemy.setVelocity(
        Math.cos(angle) * CHASE_SPEED,
        Math.sin(angle) * CHASE_SPEED
      );

      chaseCount++;
    } else {
      // 巡逻模式
      if (enemy.state !== 'patrol') {
        enemy.state = 'patrol';
        enemy.clearTint(); // 恢复原色
      }

      // 检查是否超出巡逻范围
      const distanceFromStart = Math.abs(enemy.x - enemy.patrolStartX);
      
      if (distanceFromStart > PATROL_RANGE) {
        // 反向
        enemy.patrolDirection *= -1;
      }

      // 设置巡逻速度
      enemy.setVelocity(PATROL_SPEED * enemy.patrolDirection, 0);

      patrolCount++;
    }

    // 记录敌人状态
    enemyStates.push({
      id: enemy.enemyId,
      state: enemy.state,
      x: Math.round(enemy.x),
      y: Math.round(enemy.y),
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

  // 更新状态文本
  this.statusText.setText(
    `Patrolling: ${patrolCount} | Chasing: ${chaseCount}`
  );

  // 输出日志（每60帧输出一次，避免刷屏）
  if (time % 1000 < 16) {
    console.log(JSON.stringify({
      timestamp: Math.round(time),
      patrolling: patrolCount,
      chasing: chaseCount,
      player: window.__signals__.playerPosition
    }));
  }
}

new Phaser.Game(config);