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
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDrag(500);
  player.setMaxVelocity(250);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 在场景边缘随机生成12个敌人
  const positions = [
    // 顶部
    { x: 100, y: 50 },
    { x: 300, y: 50 },
    { x: 500, y: 50 },
    { x: 700, y: 50 },
    // 底部
    { x: 100, y: 550 },
    { x: 300, y: 550 },
    { x: 500, y: 550 },
    { x: 700, y: 550 },
    // 左侧
    { x: 50, y: 200 },
    { x: 50, y: 400 },
    // 右侧
    { x: 750, y: 200 },
    { x: 750, y: 400 }
  ];

  positions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.5);
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建UI文本
  timeText = this.add.text(16, 16, 'Survival Time: 0s', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  this.add.text(400, 16, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5, 0);

  // 记录开始时间
  startTime = this.time.now;
  gameOver = false;
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  survivalTime = Math.floor((time - startTime) / 1000);
  timeText.setText('Survival Time: ' + survivalTime + 's');

  // 玩家控制
  const acceleration = 400;

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
    this.physics.moveToObject(enemy, player, 80);
  });
}

function hitEnemy(player, enemy) {
  if (gameOver) {
    return;
  }

  gameOver = true;

  // 停止玩家和所有敌人
  player.setVelocity(0, 0);
  player.setAcceleration(0, 0);
  player.setTint(0xff0000);

  enemies.children.entries.forEach(e => {
    e.setVelocity(0, 0);
  });

  // 显示游戏结束信息
  const gameOverText = this.add.text(400, 300, 'GAME OVER!\nSurvived: ' + survivalTime + 's\nClick to Restart', {
    fontSize: '32px',
    fill: '#ff0000',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 },
    align: 'center'
  });
  gameOverText.setOrigin(0.5);

  // 点击重启
  this.input.once('pointerdown', () => {
    this.scene.restart();
  });
}

new Phaser.Game(config);