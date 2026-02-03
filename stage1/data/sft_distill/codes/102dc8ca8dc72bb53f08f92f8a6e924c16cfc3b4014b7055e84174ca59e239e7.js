// 完整的 Phaser3 限时收集游戏代码
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

// 全局状态信号
window.__signals__ = {
  gameState: 'playing', // playing, win, lose
  collectedItems: 0,
  totalItems: 5,
  timeRemaining: 3.0,
  playerSpeed: 200,
  events: []
};

let player;
let items;
let cursors;
let timerText;
let statusText;
let gameTimer;
let gameOver = false;
let itemsCollected = 0;
const TOTAL_ITEMS = 5;
const TIME_LIMIT = 3; // 3秒
const PLAYER_SPEED = 200;

function preload() {
  // 不需要加载外部资源，使用程序化生成纹理
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建物品纹理（黄色圆形）
  const itemGraphics = this.add.graphics();
  itemGraphics.fillStyle(0xffdd00, 1);
  itemGraphics.fillCircle(12, 12, 12);
  itemGraphics.generateTexture('item', 24, 24);
  itemGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建物品组
  items = this.physics.add.group();

  // 随机生成物品
  for (let i = 0; i < TOTAL_ITEMS; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const item = items.create(x, y, 'item');
    item.setCircle(12); // 设置碰撞体为圆形
  }

  // 添加碰撞检测
  this.physics.add.overlap(player, items, collectItem, null, this);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建UI文本
  timerText = this.add.text(16, 16, `时间: ${TIME_LIMIT.toFixed(1)}s`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  statusText = this.add.text(16, 50, `收集: ${itemsCollected}/${TOTAL_ITEMS}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建倒计时器
  gameTimer = this.time.addEvent({
    delay: TIME_LIMIT * 1000,
    callback: onTimeUp,
    callbackScope: this,
    loop: false
  });

  // 记录游戏开始事件
  window.__signals__.events.push({
    type: 'game_start',
    timestamp: Date.now(),
    timeLimit: TIME_LIMIT
  });

  console.log(JSON.stringify({
    event: 'game_start',
    totalItems: TOTAL_ITEMS,
    timeLimit: TIME_LIMIT,
    playerSpeed: PLAYER_SPEED
  }));
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }

  // 更新倒计时显示
  const remaining = TIME_LIMIT - gameTimer.getElapsed() / 1000;
  timerText.setText(`时间: ${Math.max(0, remaining).toFixed(1)}s`);
  
  // 更新全局状态
  window.__signals__.timeRemaining = Math.max(0, remaining);
}

function collectItem(player, item) {
  // 销毁物品
  item.destroy();
  itemsCollected++;

  // 更新UI
  statusText.setText(`收集: ${itemsCollected}/${TOTAL_ITEMS}`);

  // 更新全局状态
  window.__signals__.collectedItems = itemsCollected;
  window.__signals__.events.push({
    type: 'item_collected',
    timestamp: Date.now(),
    itemsRemaining: TOTAL_ITEMS - itemsCollected
  });

  console.log(JSON.stringify({
    event: 'item_collected',
    collected: itemsCollected,
    remaining: TOTAL_ITEMS - itemsCollected
  }));

  // 检查是否收集完所有物品
  if (itemsCollected >= TOTAL_ITEMS) {
    gameWin(this.scene);
  }
}

function onTimeUp() {
  if (!gameOver && itemsCollected < TOTAL_ITEMS) {
    gameLose(this.scene);
  }
}

function gameWin(scene) {
  gameOver = true;
  player.setVelocity(0);

  // 显示胜利文本
  const winText = scene.add.text(400, 300, '胜利！', {
    fontSize: '64px',
    fill: '#00ff00',
    fontFamily: 'Arial'
  });
  winText.setOrigin(0.5);

  // 更新全局状态
  window.__signals__.gameState = 'win';
  window.__signals__.events.push({
    type: 'game_win',
    timestamp: Date.now(),
    timeRemaining: window.__signals__.timeRemaining
  });

  console.log(JSON.stringify({
    event: 'game_win',
    collectedItems: itemsCollected,
    timeRemaining: window.__signals__.timeRemaining
  }));
}

function gameLose(scene) {
  gameOver = true;
  player.setVelocity(0);

  // 显示失败文本
  const loseText = scene.add.text(400, 300, '超时失败！', {
    fontSize: '64px',
    fill: '#ff0000',
    fontFamily: 'Arial'
  });
  loseText.setOrigin(0.5);

  // 更新全局状态
  window.__signals__.gameState = 'lose';
  window.__signals__.events.push({
    type: 'game_lose',
    timestamp: Date.now(),
    collectedItems: itemsCollected
  });

  console.log(JSON.stringify({
    event: 'game_lose',
    collectedItems: itemsCollected,
    missedItems: TOTAL_ITEMS - itemsCollected
  }));
}

// 创建游戏实例
new Phaser.Game(config);