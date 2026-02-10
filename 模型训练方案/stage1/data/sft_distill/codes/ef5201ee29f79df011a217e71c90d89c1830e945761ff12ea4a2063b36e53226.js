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
const PATROL_SPEED = 120;
const CHASE_SPEED = 150;
const CHASE_DISTANCE = 150;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（青色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ffff, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成8个敌人，分布在不同位置
  const positions = [
    { x: 100, y: 100, minX: 50, maxX: 250 },
    { x: 700, y: 100, minX: 550, maxX: 750 },
    { x: 100, y: 500, minX: 50, maxX: 250 },
    { x: 700, y: 500, minX: 550, maxX: 750 },
    { x: 200, y: 250, minX: 100, maxX: 350 },
    { x: 600, y: 250, minX: 450, maxX: 700 },
    { x: 200, y: 400, minX: 100, maxX: 350 },
    { x: 600, y: 400, minX: 450, maxX: 700 }
  ];

  positions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    
    // 存储巡逻边界和状态
    enemy.patrolMinX = pos.minX;
    enemy.patrolMaxX = pos.maxX;
    enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // 随机初始方向
    enemy.state = 'patrol'; // patrol 或 chase
    
    // 设置初始巡逻速度
    enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
  });

  // 添加碰撞检测（可选，让敌人和玩家有物理交互）
  this.physics.add.collider(player, enemies);

  // 添加说明文字
  this.add.text(10, 10, 'Arrow Keys: Move Player', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.add.text(10, 30, 'Cyan enemies patrol and chase when close', {
    fontSize: '16px',
    fill: '#00ffff'
  });
}

function update(time, delta) {
  // 玩家移动控制
  player.setVelocity(0);

  if (this.cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(200);
  }

  if (this.cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (this.cursors.down.isDown) {
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

    if (distance < CHASE_DISTANCE) {
      // 追踪模式
      enemy.state = 'chase';
      chaseCount++;

      // 计算朝向玩家的方向向量
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );

      enemy.setVelocity(
        Math.cos(angle) * CHASE_SPEED,
        Math.sin(angle) * CHASE_SPEED
      );

      // 改变颜色表示追踪状态（红色）
      enemy.setTint(0xff6666);

    } else {
      // 巡逻模式
      enemy.state = 'patrol';
      patrolCount++;

      // 恢复青色
      enemy.clearTint();

      // 检查是否到达巡逻边界
      if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
        enemy.patrolDirection = 1;
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      } else if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
        enemy.patrolDirection = -1;
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }

      // 保持y轴速度为0（水平巡逻）
      enemy.setVelocityY(0);
    }

    // 记录敌人状态
    enemyStates.push({
      x: Math.round(enemy.x),
      y: Math.round(enemy.y),
      state: enemy.state,
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

  // 每秒输出一次日志（用于验证）
  if (!this.lastLogTime || time - this.lastLogTime > 1000) {
    this.lastLogTime = time;
    console.log(JSON.stringify({
      timestamp: Math.round(time),
      patrolling: patrolCount,
      chasing: chaseCount,
      playerPos: window.__signals__.playerPosition
    }));
  }
}

new Phaser.Game(config);