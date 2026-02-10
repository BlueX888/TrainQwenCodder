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
  }
};

let player;
let enemies;
let cursors;
let gameOver = false;
let survivalTime = 0;
let startTime;

// 初始化信号对象
window.__signals__ = {
  survivalTime: 0,
  enemyCount: 20,
  gameOver: false,
  collisions: 0,
  playerPosition: { x: 0, y: 0 }
};

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
  player.setMaxVelocity(200, 200);
  
  // 创建敌人组
  enemies = this.physics.add.group();
  
  // 生成20个敌人，随机位置
  for (let i = 0; i < 20; i++) {
    let x, y;
    // 确保敌人不会生成在玩家附近
    do {
      x = Phaser.Math.Between(50, 750);
      y = Phaser.Math.Between(50, 550);
    } while (Phaser.Math.Distance.Between(x, y, 400, 300) < 150);
    
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.5);
  }
  
  // 设置碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);
  
  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示提示文本
  const instructions = this.add.text(16, 16, 'Use Arrow Keys to Move\nAvoid the Red Enemies!', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  instructions.setScrollFactor(0);
  instructions.setDepth(100);
  
  // 存活时间显示
  this.timeText = this.add.text(16, 80, 'Time: 0s', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.timeText.setScrollFactor(0);
  this.timeText.setDepth(100);
  
  console.log(JSON.stringify({
    event: 'game_start',
    enemyCount: 20,
    playerPosition: { x: 400, y: 300 }
  }));
}

function update(time, delta) {
  if (gameOver) {
    return;
  }
  
  // 更新存活时间
  survivalTime = Math.floor((time - startTime) / 1000);
  this.timeText.setText('Time: ' + survivalTime + 's');
  
  // 玩家移动控制
  player.setVelocity(0);
  
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  }
  
  // 敌人追踪玩家
  enemies.children.entries.forEach(enemy => {
    this.physics.moveToObject(enemy, player, 80);
  });
  
  // 更新信号
  window.__signals__.survivalTime = survivalTime;
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };
  window.__signals__.gameOver = gameOver;
}

function hitEnemy(player, enemy) {
  if (gameOver) return;
  
  gameOver = true;
  
  // 停止所有物理运动
  this.physics.pause();
  
  // 玩家变红
  player.setTint(0xff0000);
  
  // 更新信号
  window.__signals__.gameOver = true;
  window.__signals__.collisions += 1;
  
  // 显示游戏结束文本
  const gameOverText = this.add.text(400, 300, 'GAME OVER!\nSurvived: ' + survivalTime + 's\nClick to Restart', {
    fontSize: '32px',
    fill: '#ff0000',
    backgroundColor: '#000000',
    padding: { x: 20, y: 20 },
    align: 'center'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setDepth(200);
  
  console.log(JSON.stringify({
    event: 'game_over',
    survivalTime: survivalTime,
    collisions: window.__signals__.collisions,
    finalPosition: { x: Math.round(player.x), y: Math.round(player.y) }
  }));
  
  // 点击重启
  this.input.once('pointerdown', () => {
    this.scene.restart();
    gameOver = false;
    survivalTime = 0;
    window.__signals__.collisions = 0;
    window.__signals__.gameOver = false;
  });
}

const game = new Phaser.Game(config);