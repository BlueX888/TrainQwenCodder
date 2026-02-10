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

// 全局信号对象
window.__signals__ = {
  playerPosition: { x: 0, y: 0 },
  enemies: [],
  events: []
};

let player;
let enemies;
let cursors;
const PATROL_SPEED = 200;
const CHASE_SPEED = 250;
const CHASE_DISTANCE = 150;
const PATROL_BOUNDS = { left: 100, right: 700 };

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（粉色）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
  enemyGraphics.fillCircle(12, 12, 12);
  enemyGraphics.generateTexture('enemy', 24, 24);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 创建3个敌人，分布在不同位置
  const enemyPositions = [
    { x: 200, y: 150 },
    { x: 400, y: 250 },
    { x: 600, y: 350 }
  ];

  enemyPositions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    
    // 自定义属性
    enemy.patrolDirection = index % 2 === 0 ? 1 : -1; // 交替初始方向
    enemy.isChasing = false;
    enemy.enemyId = index;
    enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);

    // 初始化信号
    window.__signals__.enemies.push({
      id: index,
      x: pos.x,
      y: pos.y,
      state: 'patrol',
      direction: enemy.patrolDirection
    });
  });

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文字
  this.add.text(10, 10, 'Arrow keys to move\nEnemies patrol and chase when near', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 记录创建事件
  window.__signals__.events.push({
    time: 0,
    type: 'game_start',
    enemyCount: 3
  });
}

function update(time, delta) {
  // 玩家移动
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

  // 更新玩家位置信号
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };

  // 敌人AI逻辑
  enemies.children.entries.forEach((enemy) => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    const wasChasing = enemy.isChasing;

    // 判断是否应该追踪
    if (distance < CHASE_DISTANCE) {
      // 追踪模式
      enemy.isChasing = true;

      // 计算朝向玩家的方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );

      enemy.setVelocity(
        Math.cos(angle) * CHASE_SPEED,
        Math.sin(angle) * CHASE_SPEED
      );

    } else {
      // 巡逻模式
      enemy.isChasing = false;

      // 检查边界并反向
      if (enemy.x <= PATROL_BOUNDS.left) {
        enemy.patrolDirection = 1;
        enemy.x = PATROL_BOUNDS.left;
      } else if (enemy.x >= PATROL_BOUNDS.right) {
        enemy.patrolDirection = -1;
        enemy.x = PATROL_BOUNDS.right;
      }

      enemy.setVelocity(
        PATROL_SPEED * enemy.patrolDirection,
        0
      );
    }

    // 状态改变时记录事件
    if (wasChasing !== enemy.isChasing) {
      window.__signals__.events.push({
        time: Math.round(time),
        type: 'state_change',
        enemyId: enemy.enemyId,
        newState: enemy.isChasing ? 'chase' : 'patrol',
        distance: Math.round(distance)
      });
    }

    // 更新敌人信号
    window.__signals__.enemies[enemy.enemyId] = {
      id: enemy.enemyId,
      x: Math.round(enemy.x),
      y: Math.round(enemy.y),
      state: enemy.isChasing ? 'chase' : 'patrol',
      direction: enemy.patrolDirection,
      distanceToPlayer: Math.round(distance)
    };
  });

  // 限制事件日志长度
  if (window.__signals__.events.length > 50) {
    window.__signals__.events = window.__signals__.events.slice(-50);
  }
}

const game = new Phaser.Game(config);