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
let gameOver = false;
let survivalTime = 0;
let scoreText;
let gameOverText;

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理
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
  player.setDamping(true);
  player.setDrag(0.8);
  player.setMaxVelocity(300);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 在场景边缘随机生成8个敌人
  const positions = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 100, y: 500 },
    { x: 700, y: 500 },
    { x: 400, y: 50 },
    { x: 400, y: 550 },
    { x: 50, y: 300 },
    { x: 750, y: 300 }
  ];

  positions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示分数文本
  scoreText = this.add.text(16, 16, 'Survival Time: 0s', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 创建游戏结束文本（初始隐藏）
  gameOverText = this.add.text(400, 300, 'GAME OVER\nClick to Restart', {
    fontSize: '48px',
    fill: '#ff0000',
    align: 'center'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);

  // 点击重启
  this.input.on('pointerdown', () => {
    if (gameOver) {
      this.scene.restart();
      gameOver = false;
      survivalTime = 0;
    }
  });
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  survivalTime += delta;
  scoreText.setText('Survival Time: ' + Math.floor(survivalTime / 1000) + 's');

  // 玩家控制
  const acceleration = 500;

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
  enemies.children.entries.forEach(enemy => {
    this.physics.moveToObject(enemy, player, 200);
  });
}

function hitEnemy(player, enemy) {
  if (!gameOver) {
    gameOver = true;

    // 停止玩家移动
    player.setVelocity(0, 0);
    player.setAcceleration(0, 0);

    // 停止所有敌人
    enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 显示游戏结束文本
    gameOverText.setVisible(true);

    // 玩家变红表示死亡
    player.setTint(0xff0000);
  }
}

const game = new Phaser.Game(config);