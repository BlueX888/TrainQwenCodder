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
let trackingCount = 0; // 状态信号：正在追踪的敌人数量
let statusText;

const PATROL_SPEED = 120;
const CHASE_SPEED = 150;
const DETECTION_RANGE = 200;
const PATROL_RANGE = 150;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillRect(0, 0, 28, 28);
  enemyGraphics.generateTexture('enemy', 28, 28);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成12个敌人，分布在不同位置
  const positions = [
    { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 }, { x: 700, y: 100 },
    { x: 100, y: 250 }, { x: 300, y: 250 }, { x: 500, y: 250 }, { x: 700, y: 250 },
    { x: 100, y: 400 }, { x: 300, y: 400 }, { x: 500, y: 400 }, { x: 700, y: 400 }
  ];

  positions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0);
    
    // 设置敌人的自定义属性
    enemy.patrolStartX = pos.x;
    enemy.patrolDirection = (index % 2 === 0) ? 1 : -1; // 交替初始方向
    enemy.isChasing = false;
    
    // 设置初始巡逻速度
    enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
  });

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update() {
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

  // 重置追踪计数
  trackingCount = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 检测玩家是否在追踪范围内
    if (distance < DETECTION_RANGE) {
      // 追踪模式
      if (!enemy.isChasing) {
        enemy.isChasing = true;
      }
      
      trackingCount++;

      // 计算追踪方向
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
      if (enemy.isChasing) {
        enemy.isChasing = false;
        // 恢复巡逻速度
        enemy.setVelocityY(0);
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }

      // 巡逻边界检测
      const distanceFromStart = Math.abs(enemy.x - enemy.patrolStartX);
      
      if (distanceFromStart > PATROL_RANGE) {
        // 到达巡逻边界，反向
        enemy.patrolDirection *= -1;
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }

      // 世界边界检测
      if (enemy.x <= 14 || enemy.x >= 786) {
        enemy.patrolDirection *= -1;
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }
    }
  });

  // 更新状态显示
  statusText.setText([
    `Tracking Enemies: ${trackingCount}/12`,
    `Player Position: (${Math.floor(player.x)}, ${Math.floor(player.y)})`,
    `Use Arrow Keys to Move`
  ]);
}

// 启动游戏
new Phaser.Game(config);