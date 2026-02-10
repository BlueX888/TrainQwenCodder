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
let enemyData = []; // 存储每个敌人的状态数据

// 状态信号变量
let trackingEnemiesCount = 0; // 正在追踪玩家的敌人数量
let totalEnemies = 15;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（绿色方块）
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0x00ff00, 1);
  enemyGraphics.fillRect(0, 0, 28, 28);
  enemyGraphics.generateTexture('enemy', 28, 28);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成15个敌人，随机分布
  for (let i = 0; i < totalEnemies; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1, 1);

    // 为每个敌人存储状态数据
    enemyData.push({
      sprite: enemy,
      patrolDirection: Phaser.Math.Between(0, 1) === 0 ? -1 : 1, // -1左，1右
      patrolSpeed: 200,
      chaseSpeed: 200,
      detectionRange: 150, // 检测范围
      isChasing: false,
      patrolMinX: x - 100, // 巡逻范围
      patrolMaxX: x + 100
    });

    // 设置初始巡逻速度
    enemy.setVelocityX(200 * enemyData[i].patrolDirection);
  }

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测（可选：玩家与敌人碰撞）
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文字
  this.add.text(10, 570, 'Arrow Keys to Move | Green enemies patrol and chase when close', {
    fontSize: '14px',
    fill: '#cccccc'
  });
}

function update(time, delta) {
  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-250);
  } else if (cursors.right.isDown) {
    player.setVelocityX(250);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-250);
  } else if (cursors.down.isDown) {
    player.setVelocityY(250);
  }

  // 重置追踪计数
  trackingEnemiesCount = 0;

  // 更新每个敌人的行为
  enemyData.forEach((data) => {
    const enemy = data.sprite;
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 判断是否进入追踪模式
    if (distance < data.detectionRange) {
      data.isChasing = true;
      trackingEnemiesCount++;

      // 追踪玩家
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      enemy.setVelocity(
        Math.cos(angle) * data.chaseSpeed,
        Math.sin(angle) * data.chaseSpeed
      );

      // 改变颜色表示追踪状态（红色）
      enemy.setTint(0xff0000);
    } else {
      data.isChasing = false;

      // 恢复正常颜色（绿色）
      enemy.clearTint();

      // 巡逻模式：左右往返
      // 检查是否到达巡逻边界
      if (enemy.x <= data.patrolMinX && data.patrolDirection === -1) {
        data.patrolDirection = 1;
        enemy.setVelocityX(data.patrolSpeed);
      } else if (enemy.x >= data.patrolMaxX && data.patrolDirection === 1) {
        data.patrolDirection = -1;
        enemy.setVelocityX(-data.patrolSpeed);
      }

      // 保持巡逻速度
      if (Math.abs(enemy.body.velocity.x) < data.patrolSpeed - 10) {
        enemy.setVelocityX(data.patrolSpeed * data.patrolDirection);
      }

      // 保持Y轴不动（纯左右巡逻）
      enemy.setVelocityY(0);
    }
  });

  // 更新状态显示
  this.statusText.setText([
    `Total Enemies: ${totalEnemies}`,
    `Tracking Player: ${trackingEnemiesCount}`,
    `Patrolling: ${totalEnemies - trackingEnemiesCount}`,
    `Player Position: (${Math.floor(player.x)}, ${Math.floor(player.y)})`
  ]);
}

function hitEnemy(player, enemy) {
  // 碰撞效果：敌人弹开
  this.physics.moveTo(enemy, player.x, player.y, -300);
}

new Phaser.Game(config);