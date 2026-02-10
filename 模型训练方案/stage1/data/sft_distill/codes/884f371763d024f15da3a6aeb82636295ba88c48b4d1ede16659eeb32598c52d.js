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

// 状态信号变量
let trackingCount = 0; // 正在追踪玩家的敌人数量
let playerSpeed = 200;
const ENEMY_SPEED = 120;
const DETECTION_RANGE = 150; // 敌人检测玩家的距离

let player;
let enemies;
let cursors;
let statusText;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 30, 30);
  playerGraphics.generateTexture('player', 30, 30);
  playerGraphics.destroy();

  // 创建敌人纹理（黄色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xffff00, 1);
  enemyGraphics.fillRect(0, 0, 25, 25);
  enemyGraphics.generateTexture('enemy', 25, 25);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成10个敌人，随机分布
  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const enemy = enemies.create(x, y, 'enemy');
    
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0);
    
    // 为每个敌人添加自定义属性
    enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // 随机初始方向
    enemy.isTracking = false; // 是否正在追踪玩家
    enemy.patrolMinX = Math.max(50, x - 150); // 巡逻左边界
    enemy.patrolMaxX = Math.min(750, x + 150); // 巡逻右边界
    
    // 设置初始速度
    enemy.setVelocityX(ENEMY_SPEED * enemy.patrolDirection);
  }

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文字
  this.add.text(10, 570, '使用方向键移动玩家', {
    fontSize: '14px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 玩家移动控制
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

  // 重置追踪计数
  trackingCount = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 判断是否应该追踪玩家
    if (distance < DETECTION_RANGE) {
      enemy.isTracking = true;
      trackingCount++;

      // 追踪模式：朝向玩家移动
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      
      enemy.setVelocity(
        Math.cos(angle) * ENEMY_SPEED,
        Math.sin(angle) * ENEMY_SPEED
      );

      // 改变颜色提示追踪状态（橙色）
      enemy.setTint(0xffa500);
    } else {
      enemy.isTracking = false;
      enemy.clearTint();

      // 巡逻模式：左右往返
      // 检查是否到达巡逻边界
      if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
        enemy.patrolDirection = 1;
        enemy.setVelocityX(ENEMY_SPEED);
      } else if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
        enemy.patrolDirection = -1;
        enemy.setVelocityX(-ENEMY_SPEED);
      } else {
        // 保持当前巡逻方向
        enemy.setVelocityX(ENEMY_SPEED * enemy.patrolDirection);
      }
      
      // 巡逻时Y轴速度为0
      enemy.setVelocityY(0);
    }
  });

  // 更新状态显示
  statusText.setText([
    `追踪中的敌人: ${trackingCount}/10`,
    `玩家位置: (${Math.floor(player.x)}, ${Math.floor(player.y)})`,
    `检测范围: ${DETECTION_RANGE}px`
  ]);
}

new Phaser.Game(config);