const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

// 全局信号对象
window.__signals__ = {
  gameOver: false,
  survivalTime: 0,
  enemiesCaught: false,
  playerPosition: { x: 0, y: 0 },
  enemyPositions: []
};

let player;
let enemies;
let cursors;
let gameOver = false;
let survivalTimeText;
let startTime;

function preload() {
  // 不需要加载外部资源
}

function create() {
  startTime = this.time.now;
  
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
  
  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
  
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(300, 300);
  
  // 创建敌人组
  enemies = this.physics.add.group();
  
  // 在场景边缘创建3个敌人
  const enemyPositions = [
    { x: 100, y: 100 },   // 左上
    { x: 700, y: 100 },   // 右上
    { x: 400, y: 500 }    // 下中
  ];
  
  enemyPositions.forEach(pos => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
  });
  
  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加WASD控制
  this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示存活时间
  survivalTimeText = this.add.text(16, 16, 'Survival Time: 0s', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  // 显示提示信息
  this.add.text(400, 30, 'Use Arrow Keys or WASD to move. Avoid the red enemies!', {
    fontSize: '16px',
    fill: '#ffff00'
  }).setOrigin(0.5);
  
  console.log(JSON.stringify({
    event: 'game_start',
    timestamp: Date.now(),
    playerPosition: { x: player.x, y: player.y },
    enemyCount: enemies.getChildren().length
  }));
}

function update(time, delta) {
  if (gameOver) {
    return;
  }
  
  // 更新存活时间
  const survivalTime = Math.floor((time - startTime) / 1000);
  survivalTimeText.setText('Survival Time: ' + survivalTime + 's');
  
  // 玩家移动控制
  player.setVelocity(0);
  
  const speed = 300;
  
  if (cursors.left.isDown || this.input.keyboard.addKey('A').isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown || this.input.keyboard.addKey('D').isDown) {
    player.setVelocityX(speed);
  }
  
  if (cursors.up.isDown || this.input.keyboard.addKey('W').isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown || this.input.keyboard.addKey('S').isDown) {
    player.setVelocityY(speed);
  }
  
  // 敌人追踪玩家
  const enemySpeed = 360;
  const enemyPositions = [];
  
  enemies.getChildren().forEach(enemy => {
    // 使用 moveToObject 让敌人追踪玩家
    this.physics.moveToObject(enemy, player, enemySpeed);
    
    enemyPositions.push({
      x: Math.round(enemy.x),
      y: Math.round(enemy.y)
    });
  });
  
  // 更新信号
  window.__signals__.survivalTime = survivalTime;
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };
  window.__signals__.enemyPositions = enemyPositions;
}

function hitEnemy(player, enemy) {
  if (gameOver) {
    return;
  }
  
  gameOver = true;
  
  // 停止所有物理对象
  this.physics.pause();
  
  // 玩家变红表示被抓
  player.setTint(0xff0000);
  
  // 显示游戏结束文本
  const finalTime = Math.floor((this.time.now - startTime) / 1000);
  
  this.add.text(400, 300, 'GAME OVER!', {
    fontSize: '48px',
    fill: '#ff0000',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  this.add.text(400, 360, `You survived for ${finalTime} seconds`, {
    fontSize: '24px',
    fill: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 400, 'Refresh to play again', {
    fontSize: '20px',
    fill: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 更新信号
  window.__signals__.gameOver = true;
  window.__signals__.enemiesCaught = true;
  window.__signals__.survivalTime = finalTime;
  
  console.log(JSON.stringify({
    event: 'game_over',
    timestamp: Date.now(),
    survivalTime: finalTime,
    playerPosition: { x: player.x, y: player.y },
    causeOfDeath: 'caught_by_enemy'
  }));
}

new Phaser.Game(config);