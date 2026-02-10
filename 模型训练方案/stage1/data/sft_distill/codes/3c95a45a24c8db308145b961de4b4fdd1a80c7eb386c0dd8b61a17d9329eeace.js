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

// 游戏状态变量
let player;
let items;
let cursors;
let timeText;
let scoreText;
let gameOverText;
let timerEvent;
let timeRemaining = 20;
let itemsCollected = 0;
let totalItems = 10;
let gameOver = false;
let gameWon = false;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建物品纹理
  const itemGraphics = this.add.graphics();
  itemGraphics.fillStyle(0xffff00, 1);
  itemGraphics.fillRect(0, 0, 20, 20);
  itemGraphics.generateTexture('item', 20, 20);
  itemGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建物品组
  items = this.physics.add.group();

  // 随机生成物品
  for (let i = 0; i < totalItems; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const item = items.create(x, y, 'item');
    item.setImmovable(true);
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, items, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建UI文本
  timeText = this.add.text(16, 16, 'Time: 20s', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  scoreText = this.add.text(16, 48, `Items: 0/${totalItems}`, {
    fontSize: '24px',
    fill: '#ffffff'
  });

  gameOverText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ff0000',
    fontStyle: 'bold'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);

  // 创建20秒倒计时
  timerEvent = this.time.addEvent({
    delay: 1000,
    callback: updateTimer,
    callbackScope: this,
    loop: true
  });
}

function update() {
  if (gameOver) {
    return;
  }

  // 玩家移动控制，速度200
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

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(200);
  }
}

function collectItem(player, item) {
  // 移除收集的物品
  item.destroy();
  itemsCollected++;

  // 更新分数显示
  scoreText.setText(`Items: ${itemsCollected}/${totalItems}`);

  // 检查是否收集完所有物品
  if (itemsCollected >= totalItems) {
    winGame.call(this);
  }
}

function updateTimer() {
  if (gameOver) {
    return;
  }

  timeRemaining--;
  timeText.setText(`Time: ${timeRemaining}s`);

  // 时间耗尽
  if (timeRemaining <= 0) {
    loseGame.call(this);
  }
}

function winGame() {
  gameOver = true;
  gameWon = true;
  timerEvent.remove();

  player.setVelocity(0);

  gameOverText.setText('YOU WIN!');
  gameOverText.setStyle({ fill: '#00ff00' });
  gameOverText.setVisible(true);

  console.log('Game Won! Items collected:', itemsCollected, 'Time remaining:', timeRemaining);
}

function loseGame() {
  gameOver = true;
  gameWon = false;
  timerEvent.remove();

  player.setVelocity(0);

  gameOverText.setText('TIME UP! YOU LOSE!');
  gameOverText.setStyle({ fill: '#ff0000' });
  gameOverText.setVisible(true);

  console.log('Game Lost! Items collected:', itemsCollected, 'out of', totalItems);
}

// 启动游戏
new Phaser.Game(config);