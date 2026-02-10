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

// 状态信号变量
let enemiesTrackingCount = 0; // 正在追踪玩家的敌人数量
let player;
let enemies;
let cursors;

const PATROL_SPEED = 80;
const CHASE_SPEED = 120;
const CHASE_DISTANCE = 150; // 开始追踪的距离
const PATROL_DISTANCE = 200; // 恢复巡逻的距离

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x3498db, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（灰色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x7f8c8d, 1);
  enemyGraphics.fillRect(0, 0, 28, 28);
  enemyGraphics.generateTexture('enemy', 28, 28);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成15个敌人
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const enemy = enemies.create(x, y, 'enemy');
    
    // 设置敌人属性
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    
    // 自定义属性：巡逻模式
    enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // -1左，1右
    enemy.patrolMinX = Math.max(50, x - 150);
    enemy.patrolMaxX = Math.min(750, x + 150);
    enemy.isChasing = false;
    
    // 设置初始速度
    enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
  }

  // 添加敌人之间的碰撞
  this.physics.add.collider(enemies, enemies);

  // 添加玩家与敌人的碰撞
  this.physics.add.collider(player, enemies);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#fff',
    backgroundColor: '#000',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  // 玩家控制
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
  enemiesTrackingCount = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 判断是否应该追踪玩家
    if (distance < CHASE_DISTANCE && !enemy.isChasing) {
      // 开始追踪
      enemy.isChasing = true;
    } else if (distance > PATROL_DISTANCE && enemy.isChasing) {
      // 恢复巡逻
      enemy.isChasing = false;
    }

    if (enemy.isChasing) {
      // 追踪模式：朝向玩家移动
      enemiesTrackingCount++;
      
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      
      enemy.setVelocity(
        Math.cos(angle) * CHASE_SPEED,
        Math.sin(angle) * CHASE_SPEED
      );
      
      // 改变颜色提示（红色）
      enemy.setTint(0xe74c3c);
    } else {
      // 巡逻模式：左右往返
      enemy.clearTint();
      
      // 检查是否到达巡逻边界
      if (enemy.x <= enemy.patrolMinX && enemy.body.velocity.x < 0) {
        enemy.patrolDirection = 1;
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      } else if (enemy.x >= enemy.patrolMaxX && enemy.body.velocity.x > 0) {
        enemy.patrolDirection = -1;
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }
      
      // 保持巡逻速度
      if (Math.abs(enemy.body.velocity.x) < PATROL_SPEED - 10) {
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }
      
      // 清除Y轴速度（仅水平巡逻）
      enemy.setVelocityY(0);
    }
  });

  // 更新状态显示
  this.statusText.setText(
    `Enemies Tracking: ${enemiesTrackingCount}/15\n` +
    `Player Position: (${Math.floor(player.x)}, ${Math.floor(player.y)})`
  );
}

new Phaser.Game(config);