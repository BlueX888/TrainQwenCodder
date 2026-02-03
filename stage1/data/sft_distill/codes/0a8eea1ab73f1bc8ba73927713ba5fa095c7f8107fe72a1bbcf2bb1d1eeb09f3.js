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
let timerText;
let scoreText;
let resultText;
let timeRemaining = 12;
let totalItems = 8;
let collectedItems = 0;
let gameOver = false;
let gameWon = false;
let timerEvent;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建收集物品纹理（黄色圆形）
  const itemGraphics = this.add.graphics();
  itemGraphics.fillStyle(0xffff00, 1);
  itemGraphics.fillCircle(12, 12, 12);
  itemGraphics.generateTexture('item', 24, 24);
  itemGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建收集物品组
  items = this.physics.add.group();
  
  // 随机生成8个收集物品
  const positions = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 100, y: 500 },
    { x: 700, y: 500 },
    { x: 400, y: 100 },
    { x: 400, y: 500 },
    { x: 150, y: 300 },
    { x: 650, y: 300 }
  ];

  positions.forEach(pos => {
    const item = items.create(pos.x, pos.y, 'item');
    item.setCircle(12); // 设置碰撞体为圆形
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, items, collectItem, null, this);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建UI文本
  timerText = this.add.text(16, 16, `时间: ${timeRemaining}s`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  scoreText = this.add.text(16, 50, `收集: ${collectedItems}/${totalItems}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  resultText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4
  });
  resultText.setOrigin(0.5);
  resultText.setVisible(false);

  // 创建12秒倒计时器
  timerEvent = this.time.addEvent({
    delay: 1000,
    callback: updateTimer,
    callbackScope: this,
    loop: true
  });

  // 添加说明文本
  this.add.text(400, 560, '使用方向键移动收集所有黄色物品', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update() {
  if (gameOver) {
    player.setVelocity(0, 0);
    return;
  }

  // 玩家移动控制，速度为240
  const speed = 240;
  
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  } else {
    player.setVelocityY(0);
  }
}

function collectItem(player, item) {
  // 移除收集到的物品
  item.destroy();
  
  // 更新收集计数
  collectedItems++;
  scoreText.setText(`收集: ${collectedItems}/${totalItems}`);

  // 检查是否收集完所有物品
  if (collectedItems >= totalItems) {
    winGame.call(this);
  }
}

function updateTimer() {
  if (gameOver) {
    return;
  }

  timeRemaining--;
  timerText.setText(`时间: ${timeRemaining}s`);

  // 时间用完，游戏失败
  if (timeRemaining <= 0) {
    loseGame.call(this);
  }
}

function winGame() {
  gameOver = true;
  gameWon = true;
  
  // 停止计时器
  if (timerEvent) {
    timerEvent.remove();
  }

  // 显示胜利信息
  resultText.setText('胜利！\n收集完成！');
  resultText.setFill('#00ff00');
  resultText.setVisible(true);

  console.log('Game Won! Collected:', collectedItems, 'Time remaining:', timeRemaining);
}

function loseGame() {
  gameOver = true;
  gameWon = false;
  
  // 停止计时器
  if (timerEvent) {
    timerEvent.remove();
  }

  // 显示失败信息
  resultText.setText('失败！\n时间用尽！');
  resultText.setFill('#ff0000');
  resultText.setVisible(true);

  console.log('Game Over! Collected:', collectedItems, '/', totalItems);
}

// 启动游戏
new Phaser.Game(config);