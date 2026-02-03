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

// 游戏状态变量
let gameState = {
  enemiesPatrolling: 8,
  enemiesChasing: 0,
  playerSpeed: 200
};

let player;
let enemies;
let cursors;
let statusText;

const PATROL_SPEED = 240;
const CHASE_SPEED = 260;
const DETECTION_RANGE = 200;
const PATROL_BOUNDARY_LEFT = 50;
const PATROL_BOUNDARY_RIGHT = 750;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 30, 30);
  playerGraphics.generateTexture('player', 30, 30);
  playerGraphics.destroy();

  // 创建敌人纹理（黄色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xffff00, 1);
  enemyGraphics.fillCircle(15, 15, 15);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 添加8个敌人，分布在不同位置
  const positions = [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 500, y: 100 },
    { x: 700, y: 100 },
    { x: 100, y: 500 },
    { x: 300, y: 500 },
    { x: 500, y: 500 },
    { x: 700, y: 500 }
  ];

  positions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    
    // 设置初始巡逻方向（奇数向右，偶数向左）
    enemy.patrolDirection = index % 2 === 0 ? 1 : -1;
    enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
    
    // 标记状态
    enemy.isChasing = false;
  });

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建状态文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(10, 560, '使用方向键移动玩家 | 黄色敌人会在接近时追踪你', {
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

  // 敌人AI逻辑
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 检测是否在追踪范围内
    if (distance < DETECTION_RANGE) {
      // 追踪模式
      if (!enemy.isChasing) {
        enemy.isChasing = true;
      }
      gameState.enemiesChasing++;

      // 计算追踪方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );

      enemy.setVelocity(
        Math.cos(angle) * CHASE_SPEED,
        Math.sin(angle) * CHASE_SPEED
      );

      // 改变颜色表示追踪状态
      enemy.setTint(0xff8800);
    } else {
      // 巡逻模式
      if (enemy.isChasing) {
        enemy.isChasing = false;
        enemy.setVelocityY(0);
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }

      // 恢复原色
      enemy.clearTint();

      // 边界检测与反向
      if (enemy.x <= PATROL_BOUNDARY_LEFT && enemy.patrolDirection === -1) {
        enemy.patrolDirection = 1;
        enemy.setVelocityX(PATROL_SPEED);
      } else if (enemy.x >= PATROL_BOUNDARY_RIGHT && enemy.patrolDirection === 1) {
        enemy.patrolDirection = -1;
        enemy.setVelocityX(-PATROL_SPEED);
      }
    }
  });

  // 更新巡逻计数
  gameState.enemiesPatrolling = 8 - gameState.enemiesChasing;

  // 更新状态文本
  statusText.setText([
    `巡逻中敌人: ${gameState.enemiesPatrolling}`,
    `追踪中敌人: ${gameState.enemiesChasing}`,
    `玩家位置: (${Math.floor(player.x)}, ${Math.floor(player.y)})`
  ]);
}

new Phaser.Game(config);