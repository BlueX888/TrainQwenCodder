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
let enemyData = []; // 存储每个敌人的巡逻数据
let enemiesTracking = 0; // 状态信号：正在追踪玩家的敌人数量
let totalEnemies = 15; // 状态信号：敌人总数
const PATROL_SPEED = 120;
const CHASE_DISTANCE = 150;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 30, 30);
  playerGraphics.generateTexture('player', 30, 30);
  playerGraphics.destroy();

  // 创建敌人纹理（蓝色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x0088ff, 1);
  enemyGraphics.fillCircle(15, 15, 15);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成15个敌人
  for (let i = 0; i < totalEnemies; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0);

    // 为每个敌人设置巡逻数据
    const patrolLeft = Phaser.Math.Between(50, 400);
    const patrolRight = patrolLeft + Phaser.Math.Between(100, 300);
    const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

    enemyData.push({
      sprite: enemy,
      patrolLeft: patrolLeft,
      patrolRight: patrolRight,
      direction: direction,
      isTracking: false
    });

    // 设置初始速度
    enemy.setVelocityX(PATROL_SPEED * direction);
  }

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.trackingText = this.add.text(10, 35, '', {
    fontSize: '16px',
    fill: '#ffff00'
  });
}

function update() {
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

  // 重置追踪计数
  enemiesTracking = 0;

  // 更新每个敌人的行为
  enemyData.forEach(data => {
    const enemy = data.sprite;
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 判断是否应该追踪玩家
    if (distance < CHASE_DISTANCE) {
      // 追踪模式
      data.isTracking = true;
      enemiesTracking++;

      // 计算朝向玩家的方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );

      // 设置速度朝向玩家
      enemy.setVelocity(
        Math.cos(angle) * PATROL_SPEED,
        Math.sin(angle) * PATROL_SPEED
      );
    } else {
      // 巡逻模式
      data.isTracking = false;

      // 检查是否到达巡逻边界
      if (enemy.x <= data.patrolLeft && data.direction === -1) {
        data.direction = 1;
        enemy.setVelocityX(PATROL_SPEED);
      } else if (enemy.x >= data.patrolRight && data.direction === 1) {
        data.direction = -1;
        enemy.setVelocityX(-PATROL_SPEED);
      } else {
        // 保持当前方向的速度
        enemy.setVelocityX(PATROL_SPEED * data.direction);
      }

      // 清除Y轴速度（仅水平巡逻）
      enemy.setVelocityY(0);
    }
  });

  // 更新状态显示
  this.trackingText.setText(
    `Enemies Tracking: ${enemiesTracking}/${totalEnemies}`
  );
}

new Phaser.Game(config);