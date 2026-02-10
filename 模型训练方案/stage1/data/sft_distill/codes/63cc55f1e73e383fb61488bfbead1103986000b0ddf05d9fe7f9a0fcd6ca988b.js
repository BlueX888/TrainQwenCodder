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
let timeText;
let statusText;

function preload() {
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
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.8);
  player.setMaxVelocity(200);

  // 创建敌人组
  enemies = this.physics.add.group({
    key: 'enemy',
    repeat: 9, // 创建10个敌人（0-9）
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
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示存活时间
  timeText = this.add.text(16, 16, 'Survival Time: 0.0s', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 状态文本
  statusText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ff0000',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 }
  });
  statusText.setOrigin(0.5);
  statusText.setVisible(false);

  // 添加说明文本
  this.add.text(16, 560, 'Use Arrow Keys to Move | Avoid Red Enemies!', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });

  // 重置游戏状态
  gameOver = false;
  survivalTime = 0;
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  survivalTime += delta / 1000;
  timeText.setText('Survival Time: ' + survivalTime.toFixed(1) + 's');

  // 玩家控制
  const acceleration = 300;
  
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
  enemies.children.iterate((enemy) => {
    // 计算敌人到玩家的方向并设置速度
    this.physics.moveToObject(enemy, player, 120);
  });
}

function hitEnemy(player, enemy) {
  if (gameOver) {
    return;
  }

  // 游戏结束
  gameOver = true;

  // 停止所有物理运动
  this.physics.pause();

  // 玩家变红
  player.setTint(0xff0000);

  // 显示游戏结束信息
  statusText.setText('GAME OVER!\nSurvived: ' + survivalTime.toFixed(1) + 's');
  statusText.setVisible(true);

  // 3秒后重启游戏
  this.time.delayedCall(3000, () => {
    this.scene.restart();
  });
}

const game = new Phaser.Game(config);