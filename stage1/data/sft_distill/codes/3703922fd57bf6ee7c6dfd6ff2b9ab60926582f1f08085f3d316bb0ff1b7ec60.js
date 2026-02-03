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

// 全局信号对象
window.__signals__ = {
  gameActive: true,
  survivalTime: 0,
  collisionCount: 0,
  playerPosition: { x: 0, y: 0 },
  enemyPositions: [],
  gameOver: false
};

let player;
let enemies;
let cursors;
let gameStartTime;
let gameOverText;

function preload() {
  // 创建玩家纹理（蓝色圆形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillCircle(20, 20, 20);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(15, 15, 15);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();
}

function create() {
  gameStartTime = this.time.now;

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.8);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 在不同位置创建 3 个敌人
  const enemyPositions = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 400, y: 500 }
  ];

  enemyPositions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
  });

  // 设置碰撞检测
  this.physics.add.overlap(player, enemies, handleCollision, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.add.text(10, 30, 'Avoid the Red Enemies!', {
    fontSize: '16px',
    fill: '#ff0000'
  });

  // 游戏结束文本（初始隐藏）
  gameOverText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ff0000',
    align: 'center'
  }).setOrigin(0.5).setVisible(false);

  // 初始化信号
  window.__signals__.gameActive = true;
  window.__signals__.gameOver = false;
  window.__signals__.collisionCount = 0;

  console.log(JSON.stringify({
    event: 'game_start',
    timestamp: Date.now(),
    playerPosition: { x: player.x, y: player.y },
    enemyCount: enemies.getChildren().length
  }));
}

function update(time, delta) {
  if (!window.__signals__.gameActive) {
    return;
  }

  // 更新存活时间
  window.__signals__.survivalTime = Math.floor((time - gameStartTime) / 1000);

  // 玩家移动控制
  const playerSpeed = 200;
  
  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
  } else {
    player.setVelocityY(0);
  }

  // 敌人追踪玩家
  const enemySpeed = 360;
  enemies.getChildren().forEach(enemy => {
    this.physics.moveToObject(enemy, player, enemySpeed);
  });

  // 更新信号数据
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };

  window.__signals__.enemyPositions = enemies.getChildren().map(enemy => ({
    x: Math.round(enemy.x),
    y: Math.round(enemy.y)
  }));

  // 每秒输出一次状态日志
  if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
    console.log(JSON.stringify({
      event: 'game_update',
      timestamp: Date.now(),
      survivalTime: window.__signals__.survivalTime,
      playerPosition: window.__signals__.playerPosition,
      enemyPositions: window.__signals__.enemyPositions,
      gameActive: window.__signals__.gameActive
    }));
  }
}

function handleCollision(player, enemy) {
  if (!window.__signals__.gameActive) {
    return;
  }

  window.__signals__.collisionCount++;
  window.__signals__.gameActive = false;
  window.__signals__.gameOver = true;

  // 停止所有物理对象
  player.setVelocity(0, 0);
  enemies.getChildren().forEach(e => {
    e.setVelocity(0, 0);
  });

  // 显示游戏结束信息
  gameOverText.setText(
    `GAME OVER!\n\nSurvival Time: ${window.__signals__.survivalTime}s\n\nPress F5 to Restart`
  ).setVisible(true);

  console.log(JSON.stringify({
    event: 'game_over',
    timestamp: Date.now(),
    survivalTime: window.__signals__.survivalTime,
    collisionCount: window.__signals__.collisionCount,
    finalPlayerPosition: window.__signals__.playerPosition,
    enemyPositions: window.__signals__.enemyPositions
  }));
}

new Phaser.Game(config);