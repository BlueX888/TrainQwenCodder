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

// 游戏状态变量（可验证）
let gameState = {
  collected: 0,
  total: 10,
  timeLeft: 20,
  gameOver: false,
  isWin: false
};

let player;
let items;
let cursors;
let timerText;
let scoreText;
let resultText;
let countdownTimer;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建物品纹理
  const itemGraphics = this.add.graphics();
  itemGraphics.fillStyle(0xffff00, 1);
  itemGraphics.fillCircle(12, 12, 12);
  itemGraphics.generateTexture('item', 24, 24);
  itemGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建物品组
  items = this.physics.add.group();
  
  // 随机生成10个物品
  for (let i = 0; i < gameState.total; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const item = items.create(x, y, 'item');
    item.setCollideWorldBounds(true);
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, items, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建UI文本
  scoreText = this.add.text(16, 16, 'Collected: 0/' + gameState.total, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  timerText = this.add.text(16, 50, 'Time: 20s', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  resultText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4
  });
  resultText.setOrigin(0.5);
  resultText.setVisible(false);

  // 创建20秒倒计时
  countdownTimer = this.time.addEvent({
    delay: 1000,
    callback: updateTimer,
    callbackScope: this,
    loop: true
  });

  // 重置游戏状态
  gameState.collected = 0;
  gameState.timeLeft = 20;
  gameState.gameOver = false;
  gameState.isWin = false;
}

function update() {
  if (gameState.gameOver) {
    return;
  }

  // 玩家移动控制（速度360）
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-360);
  } else if (cursors.right.isDown) {
    player.setVelocityX(360);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-360);
  } else if (cursors.down.isDown) {
    player.setVelocityY(360);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.setVelocity(
      player.body.velocity.x * 0.707,
      player.body.velocity.y * 0.707
    );
  }
}

function collectItem(player, item) {
  // 销毁物品
  item.destroy();
  
  // 更新收集数量
  gameState.collected++;
  scoreText.setText('Collected: ' + gameState.collected + '/' + gameState.total);

  // 检查是否收集完所有物品
  if (gameState.collected >= gameState.total) {
    winGame.call(this);
  }
}

function updateTimer() {
  if (gameState.gameOver) {
    return;
  }

  gameState.timeLeft--;
  timerText.setText('Time: ' + gameState.timeLeft + 's');

  // 时间快用完时改变颜色
  if (gameState.timeLeft <= 5) {
    timerText.setColor('#ff0000');
  }

  // 时间到
  if (gameState.timeLeft <= 0) {
    loseGame.call(this);
  }
}

function winGame() {
  gameState.gameOver = true;
  gameState.isWin = true;
  
  // 停止计时器
  countdownTimer.remove();
  
  // 停止玩家移动
  player.setVelocity(0);
  
  // 显示胜利信息
  resultText.setText('YOU WIN!');
  resultText.setColor('#00ff00');
  resultText.setVisible(true);
  
  console.log('Game Status:', gameState);
}

function loseGame() {
  gameState.gameOver = true;
  gameState.isWin = false;
  
  // 停止计时器
  countdownTimer.remove();
  
  // 停止玩家移动
  player.setVelocity(0);
  
  // 显示失败信息
  resultText.setText('TIME OUT! YOU LOSE!');
  resultText.setColor('#ff0000');
  resultText.setVisible(true);
  
  console.log('Game Status:', gameState);
}

// 启动游戏
new Phaser.Game(config);