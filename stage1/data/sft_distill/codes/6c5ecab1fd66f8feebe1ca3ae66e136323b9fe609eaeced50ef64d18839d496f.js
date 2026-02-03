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
let wasd;
let health = 100;
let survivalTime = 0;
let healthText;
let timeText;
let gameOver = false;
let lastHitTime = 0;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（红色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(12, 12, 12);
  enemyGraphics.generateTexture('enemy', 24, 24);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDrag(500);
  player.setMaxVelocity(300);

  // 创建敌人组
  enemies = this.physics.add.group({
    key: 'enemy',
    repeat: 19, // 创建20个敌人
    setXY: {
      x: Phaser.Math.Between(50, 750),
      y: Phaser.Math.Between(50, 550),
      stepX: 0,
      stepY: 0
    }
  });

  // 随机分散敌人位置
  enemies.children.iterate((enemy) => {
    enemy.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.5);
  });

  // 设置碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // UI 文本
  healthText = this.add.text(16, 16, 'Health: 100', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  timeText = this.add.text(16, 50, 'Time: 0s', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(400, 16, 'Use Arrow Keys or WASD to move. Avoid the red enemies!', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5, 0);
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  survivalTime += delta / 1000;
  timeText.setText('Time: ' + survivalTime.toFixed(1) + 's');

  // 玩家移动控制
  const acceleration = 600;

  if (cursors.left.isDown || wasd.left.isDown) {
    player.setAccelerationX(-acceleration);
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.setAccelerationX(acceleration);
  } else {
    player.setAccelerationX(0);
  }

  if (cursors.up.isDown || wasd.up.isDown) {
    player.setAccelerationY(-acceleration);
  } else if (cursors.down.isDown || wasd.down.isDown) {
    player.setAccelerationY(acceleration);
  } else {
    player.setAccelerationY(0);
  }

  // 敌人追踪玩家
  enemies.children.iterate((enemy) => {
    if (enemy.active) {
      // 计算敌人到玩家的角度
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        player.x,
        player.y
      );

      // 设置敌人速度，朝向玩家移动
      const speed = 200;
      enemy.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // 旋转敌人朝向玩家
      enemy.rotation = angle;
    }
  });

  // 检查游戏结束
  if (health <= 0 && !gameOver) {
    gameOver = true;
    player.setTint(0x888888);
    player.setVelocity(0, 0);
    player.setAcceleration(0, 0);

    enemies.children.iterate((enemy) => {
      enemy.setVelocity(0, 0);
    });

    const gameOverText = this.add.text(400, 300, 'GAME OVER\nSurvived: ' + survivalTime.toFixed(1) + 's', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    gameOverText.setOrigin(0.5);
  }
}

function hitEnemy(player, enemy) {
  const currentTime = Date.now();
  
  // 添加无敌时间（0.5秒），避免连续扣血
  if (currentTime - lastHitTime > 500) {
    health -= 10;
    lastHitTime = currentTime;

    // 更新生命值显示
    healthText.setText('Health: ' + Math.max(0, health));

    // 玩家受击闪烁效果
    player.setTint(0xff0000);
    player.scene.time.delayedCall(100, () => {
      if (!gameOver) {
        player.clearTint();
      }
    });

    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );
    player.setVelocity(
      Math.cos(angle) * 400,
      Math.sin(angle) * 400
    );
  }
}

const game = new Phaser.Game(config);