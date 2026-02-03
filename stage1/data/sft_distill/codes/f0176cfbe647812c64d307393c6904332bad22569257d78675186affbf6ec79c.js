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

// 全局信号记录
window.__signals__ = {
  enemies: [],
  playerPosition: { x: 0, y: 0 },
  events: []
};

let player;
let enemies;
let cursors;
const PATROL_SPEED = 80;
const CHASE_SPEED = 120;
const CHASE_DISTANCE = 150;
const PATROL_BOUNDS = { left: 50, right: 750 };

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x0000ff, 1);
  enemyGraphics.fillCircle(12, 12, 12);
  enemyGraphics.generateTexture('enemy', 24, 24);
  enemyGraphics.destroy();

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

  enemyPositions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    
    // 为每个敌人添加自定义属性
    enemy.patrolDirection = index % 2 === 0 ? 1 : -1; // 交替初始方向
    enemy.isChasing = false;
    enemy.enemyId = index;
    enemy.patrolLeft = Math.max(PATROL_BOUNDS.left, pos.x - 150);
    enemy.patrolRight = Math.min(PATROL_BOUNDS.right, pos.x + 150);
    
    // 初始化巡逻速度
    enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);

    // 初始化信号
    window.__signals__.enemies.push({
      id: index,
      state: 'patrol',
      x: pos.x,
      y: pos.y,
      direction: enemy.patrolDirection
    });
  });

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文本显示
  this.add.text(10, 10, 'Arrow keys to move. Enemies patrol and chase when close.', {
    fontSize: '14px',
    fill: '#fff'
  });

  // 记录初始事件
  window.__signals__.events.push({
    time: 0,
    type: 'game_start',
    enemyCount: 5
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

  // 更新玩家位置信号
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };

  // 更新每个敌人的行为
  enemies.children.entries.forEach((enemy) => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    const wasChasing = enemy.isChasing;

    // 判断是否应该追踪玩家
    if (distance < CHASE_DISTANCE) {
      enemy.isChasing = true;
      
      // 追踪模式：朝向玩家移动
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      
      enemy.setVelocity(
        Math.cos(angle) * CHASE_SPEED,
        Math.sin(angle) * CHASE_SPEED
      );

      // 状态变化时记录事件
      if (!wasChasing) {
        window.__signals__.events.push({
          time: Math.round(time),
          type: 'enemy_chase_start',
          enemyId: enemy.enemyId,
          distance: Math.round(distance)
        });
      }
    } else {
      enemy.isChasing = false;
      
      // 巡逻模式：左右往返
      enemy.setVelocityY(0);
      
      // 检查是否到达巡逻边界
      if (enemy.x <= enemy.patrolLeft && enemy.patrolDirection === -1) {
        enemy.patrolDirection = 1;
        window.__signals__.events.push({
          time: Math.round(time),
          type: 'enemy_patrol_turn',
          enemyId: enemy.enemyId,
          direction: 'right'
        });
      } else if (enemy.x >= enemy.patrolRight && enemy.patrolDirection === 1) {
        enemy.patrolDirection = -1;
        window.__signals__.events.push({
          time: Math.round(time),
          type: 'enemy_patrol_turn',
          enemyId: enemy.enemyId,
          direction: 'left'
        });
      }
      
      enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);

      // 状态变化时记录事件
      if (wasChasing) {
        window.__signals__.events.push({
          time: Math.round(time),
          type: 'enemy_chase_end',
          enemyId: enemy.enemyId
        });
      }
    }

    // 更新敌人信号
    window.__signals__.enemies[enemy.enemyId] = {
      id: enemy.enemyId,
      state: enemy.isChasing ? 'chasing' : 'patrol',
      x: Math.round(enemy.x),
      y: Math.round(enemy.y),
      direction: enemy.patrolDirection,
      distanceToPlayer: Math.round(distance)
    };
  });

  // 限制事件日志大小
  if (window.__signals__.events.length > 100) {
    window.__signals__.events = window.__signals__.events.slice(-50);
  }
}

new Phaser.Game(config);