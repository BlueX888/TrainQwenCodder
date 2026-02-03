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
let survivalTime = 0;
let timeText;
let gameOver = false;
let startTime;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff3333, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDrag(800); // 添加拖拽效果，使移动更平滑

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成 12 个敌人，随机分布在场景边缘
  for (let i = 0; i < 12; i++) {
    let x, y;
    
    // 随机选择从哪个边缘生成
    const edge = Phaser.Math.Between(0, 3);
    switch (edge) {
      case 0: // 上边
        x = Phaser.Math.Between(0, 800);
        y = Phaser.Math.Between(0, 100);
        break;
      case 1: // 右边
        x = Phaser.Math.Between(700, 800);
        y = Phaser.Math.Between(0, 600);
        break;
      case 2: // 下边
        x = Phaser.Math.Between(0, 800);
        y = Phaser.Math.Between(500, 600);
        break;
      case 3: // 左边
        x = Phaser.Math.Between(0, 100);
        y = Phaser.Math.Between(0, 600);
        break;
    }

    const enemy = enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1); // 敌人碰到边界会反弹
  }

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示存活时间（可验证状态信号）
  timeText = this.add.text(16, 16, 'Survival Time: 0.0s', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4
  });

  // 显示提示信息
  this.add.text(400, 550, 'Use Arrow Keys to Move - Avoid Red Enemies!', {
    fontSize: '18px',
    fill: '#ffff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);

  // 记录开始时间
  startTime = this.time.now;
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  survivalTime = (time - startTime) / 1000;
  timeText.setText('Survival Time: ' + survivalTime.toFixed(1) + 's');

  // 玩家移动控制
  const playerSpeed = 200;
  
  player.setAcceleration(0);

  if (cursors.left.isDown) {
    player.setAccelerationX(-playerSpeed * 10);
  } else if (cursors.right.isDown) {
    player.setAccelerationX(playerSpeed * 10);
  }

  if (cursors.up.isDown) {
    player.setAccelerationY(-playerSpeed * 10);
  } else if (cursors.down.isDown) {
    player.setAccelerationY(playerSpeed * 10);
  }

  // 限制玩家最大速度
  const maxSpeed = playerSpeed;
  if (player.body.velocity.length() > maxSpeed) {
    player.body.velocity.normalize().scale(maxSpeed);
  }

  // 敌人追踪玩家
  const enemySpeed = 80;
  enemies.children.entries.forEach(enemy => {
    // 计算敌人到玩家的方向向量
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );

    // 设置敌人速度，使其朝向玩家
    this.physics.velocityFromAngle(
      Phaser.Math.RadToDeg(angle),
      enemySpeed,
      enemy.body.velocity
    );

    // 旋转敌人精灵面向玩家（视觉效果）
    enemy.rotation = angle;
  });
}

function hitEnemy(player, enemy) {
  if (gameOver) {
    return;
  }

  gameOver = true;

  // 停止所有物理对象
  this.physics.pause();

  // 玩家变色表示游戏结束
  player.setTint(0xff0000);

  // 显示游戏结束信息
  const gameOverText = this.add.text(400, 250, 'GAME OVER!', {
    fontSize: '64px',
    fill: '#ff0000',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 6
  }).setOrigin(0.5);

  const finalTimeText = this.add.text(400, 330, 'You survived for ' + survivalTime.toFixed(1) + ' seconds!', {
    fontSize: '28px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5);

  const restartText = this.add.text(400, 400, 'Refresh to Play Again', {
    fontSize: '24px',
    fill: '#ffff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);

  // 闪烁效果
  this.tweens.add({
    targets: gameOverText,
    alpha: 0.3,
    duration: 500,
    yoyo: true,
    repeat: -1
  });
}

new Phaser.Game(config);