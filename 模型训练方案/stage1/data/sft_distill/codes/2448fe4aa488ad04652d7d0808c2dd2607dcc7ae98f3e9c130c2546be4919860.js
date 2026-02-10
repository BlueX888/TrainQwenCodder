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
let gameState = {
  enemiesInChaseMode: 0,
  playerMoveDistance: 0,
  enemyPatrolReversals: 0
};

const PATROL_SPEED = 120;
const CHASE_SPEED = 120;
const CHASE_DISTANCE = 150;
const PATROL_BOUNDS = { left: 50, right: 750 };

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（紫色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x9b59b6, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 创建5个敌人，分布在不同位置
  const enemyPositions = [
    { x: 150, y: 100 },
    { x: 650, y: 150 },
    { x: 300, y: 400 },
    { x: 600, y: 450 },
    { x: 400, y: 250 }
  ];

  enemyPositions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    
    // 设置初始巡逻方向（交替左右）
    enemy.setData('patrolDirection', index % 2 === 0 ? 1 : -1);
    enemy.setData('mode', 'patrol'); // patrol 或 chase
    enemy.setVelocityX(PATROL_SPEED * enemy.getData('patrolDirection'));
  });

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加状态显示文本
  this.add.text(10, 10, 'WASD/方向键移动玩家', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.statusText = this.add.text(10, 35, '', {
    fontSize: '14px',
    fill: '#00ff00'
  });
}

function update(time, delta) {
  // 玩家移动控制
  const playerSpeed = 200;
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
    gameState.playerMoveDistance += Math.abs(playerSpeed * delta / 1000);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
    gameState.playerMoveDistance += Math.abs(playerSpeed * delta / 1000);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
    gameState.playerMoveDistance += Math.abs(playerSpeed * delta / 1000);
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
    gameState.playerMoveDistance += Math.abs(playerSpeed * delta / 1000);
  }

  // 重置追踪计数
  gameState.enemiesInChaseMode = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    const currentMode = enemy.getData('mode');

    // 判断是否应该切换模式
    if (distance < CHASE_DISTANCE) {
      // 进入追踪模式
      if (currentMode !== 'chase') {
        enemy.setData('mode', 'chase');
      }
      gameState.enemiesInChaseMode++;

      // 追踪玩家
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      enemy.setVelocity(
        Math.cos(angle) * CHASE_SPEED,
        Math.sin(angle) * CHASE_SPEED
      );

    } else {
      // 进入或保持巡逻模式
      if (currentMode !== 'patrol') {
        enemy.setData('mode', 'patrol');
      }

      // 巡逻逻辑：左右往返
      const patrolDirection = enemy.getData('patrolDirection');

      // 检查边界并反转方向
      if (enemy.x <= PATROL_BOUNDS.left && patrolDirection === -1) {
        enemy.setData('patrolDirection', 1);
        enemy.setVelocityX(PATROL_SPEED);
        gameState.enemyPatrolReversals++;
      } else if (enemy.x >= PATROL_BOUNDS.right && patrolDirection === 1) {
        enemy.setData('patrolDirection', -1);
        enemy.setVelocityX(-PATROL_SPEED);
        gameState.enemyPatrolReversals++;
      } else {
        // 保持当前巡逻方向
        enemy.setVelocityX(PATROL_SPEED * patrolDirection);
      }

      enemy.setVelocityY(0);
    }
  });

  // 更新状态显示
  this.statusText.setText([
    `追踪模式敌人数: ${gameState.enemiesInChaseMode}/5`,
    `玩家移动距离: ${Math.floor(gameState.playerMoveDistance)}`,
    `巡逻反转次数: ${gameState.enemyPatrolReversals}`
  ]);
}

const game = new Phaser.Game(config);