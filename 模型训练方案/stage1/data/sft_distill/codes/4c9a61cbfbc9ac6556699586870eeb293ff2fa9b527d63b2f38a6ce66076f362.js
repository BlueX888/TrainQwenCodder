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
let items;
let cursors;
let timerText;
let resultText;
let timeRemaining = 8;
let gameOver = false;
let totalItems = 5;
let collectedItems = 0;
let timerEvent;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建物品纹理（黄色圆形）
  const itemGraphics = this.add.graphics();
  itemGraphics.fillStyle(0xffff00, 1);
  itemGraphics.fillCircle(12, 12, 12);
  itemGraphics.generateTexture('item', 24, 24);
  itemGraphics.destroy();
}

function create() {
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
    item.setCircle(12); // 设置碰撞体为圆形
  }

  // 设置物品与玩家的碰撞检测
  this.physics.add.overlap(player, items, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建倒计时文本
  timerText = this.add.text(16, 16, 'Time: 8s', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建收集进度文本
  this.add.text(16, 50, 'Collected: 0/' + totalItems, {
    fontSize: '20px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  }).setName('progressText');

  // 创建结果文本（初始隐藏）
  resultText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 6
  });
  resultText.setOrigin(0.5);
  resultText.setVisible(false);

  // 设置8秒倒计时
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
  // 移除物品
  item.destroy();
  collectedItems++;

  // 更新收集进度文本
  const progressText = this.children.getByName('progressText');
  progressText.setText('Collected: ' + collectedItems + '/' + totalItems);

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
  timerText.setText('Time: ' + timeRemaining + 's');

  // 时间到
  if (timeRemaining <= 0) {
    loseGame.call(this);
  }
}

function winGame() {
  gameOver = true;
  timerEvent.remove();
  player.setVelocity(0);

  resultText.setText('SUCCESS!');
  resultText.setFill('#00ff00');
  resultText.setVisible(true);
}

function loseGame() {
  gameOver = true;
  timerEvent.remove();
  player.setVelocity(0);

  resultText.setText('FAILED!');
  resultText.setFill('#ff0000');
  resultText.setVisible(true);
}

new Phaser.Game(config);