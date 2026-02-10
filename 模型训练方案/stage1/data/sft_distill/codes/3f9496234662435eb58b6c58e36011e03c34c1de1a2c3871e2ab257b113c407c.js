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
let isGameOver = false;
let timeText;
let statusText;
let gameOverText;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(250);
  player.setDrag(800);

  // 创建敌人组
  enemies = this.physics.add.group({
    key: 'enemy',
    repeat: 14, // 创建15个敌人（0-14）
    setXY: {
      x: Phaser.Math.Between(50, 750),
      y: Phaser.Math.Between(50, 550),
      stepX: 0,
      stepY: 0
    }
  });

  // 随机分布敌人位置
  enemies.children.iterate((enemy) => {
    enemy.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.5);
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // UI文本
  timeText = this.add.text(16, 16, 'Time: 0s', {
    fontSize: '20px',
    fill: '#fff'
  });

  statusText = this.add.text(16, 45, 'Enemies: 15 | Speed: 160', {
    fontSize: '16px',
    fill: '#ffff00'
  });

  gameOverText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ff0000',
    fontStyle: 'bold'
  });
  gameOverText.setOrigin(0.5);

  // 添加提示文本
  const helpText = this.add.text(400, 570, 'Use Arrow Keys to Move', {
    fontSize: '14px',
    fill: '#888888'
  });
  helpText.setOrigin(0.5);
}

function update(time, delta) {
  if (isGameOver) {
    return;
  }

  // 更新存活时间
  survivalTime += delta;
  timeText.setText('Time: ' + Math.floor(survivalTime / 1000) + 's');

  // 玩家移动控制
  const acceleration = 600;
  
  if (cursors.left.isDown) {
    player.setAccelerationX(-acceleration);
  } else if (cursors.right.isDown) {
    player.setAccelerationX(acceleration);
  } else {
    player.setAccelerationX(0);
  }

  if (cursors.up.isDown) {
    player.setAccelerationY(-acceleration);
  } else if (cursors.down.isDown) {
    player.setAccelerationY(acceleration);
  } else {
    player.setAccelerationY(0);
  }

  // 敌人追踪玩家
  const enemySpeed = 160;
  
  enemies.children.iterate((enemy) => {
    // 计算敌人到玩家的角度
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 根据角度设置速度，使敌人追踪玩家
    this.physics.velocityFromRotation(angle, enemySpeed, enemy.body.velocity);
  });
}

function hitEnemy(player, enemy) {
  if (isGameOver) {
    return;
  }

  // 游戏结束
  isGameOver = true;

  // 停止所有物理对象
  this.physics.pause();

  // 玩家变红
  player.setTint(0xff0000);

  // 显示游戏结束信息
  gameOverText.setText('GAME OVER!\nSurvived: ' + Math.floor(survivalTime / 1000) + 's');

  // 添加重启提示
  const restartText = this.add.text(400, 400, 'Click to Restart', {
    fontSize: '24px',
    fill: '#ffffff'
  });
  restartText.setOrigin(0.5);

  // 点击重启
  this.input.once('pointerdown', () => {
    this.scene.restart();
    survivalTime = 0;
    isGameOver = false;
  });
}

new Phaser.Game(config);