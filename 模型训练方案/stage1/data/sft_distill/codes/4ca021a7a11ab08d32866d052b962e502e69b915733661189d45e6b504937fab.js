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

// 全局状态信号
window.__signals__ = {
  score: 0,
  itemsCollected: 0,
  totalItems: 8,
  playerX: 400,
  playerY: 300
};

let player;
let collectibles;
let cursors;
let scoreText;
let score = 0;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x4a90e2, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建收集物纹理（绿色圆形）
  const itemGraphics = this.add.graphics();
  itemGraphics.fillStyle(0x00ff00, 1);
  itemGraphics.fillCircle(12, 12, 12);
  itemGraphics.generateTexture('collectible', 24, 24);
  itemGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 生成8个收集物在随机位置
  for (let i = 0; i < 8; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const item = collectibles.create(x, y, 'collectible');
    item.setCircle(12); // 设置圆形碰撞体
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建提示文本
  this.add.text(400, 550, 'Use Arrow Keys to Move and Collect Green Items', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 初始化信号
  updateSignals();
}

function update() {
  // 重置玩家速度
  player.setVelocity(0);

  // 键盘控制
  const speed = 200;
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  }

  // 更新玩家位置信号
  window.__signals__.playerX = Math.round(player.x);
  window.__signals__.playerY = Math.round(player.y);
}

function collectItem(player, item) {
  // 销毁收集物
  item.destroy();

  // 增加分数
  score += 10;
  scoreText.setText('Score: ' + score);

  // 更新信号
  window.__signals__.score = score;
  window.__signals__.itemsCollected += 1;

  // 输出日志
  console.log(JSON.stringify({
    event: 'item_collected',
    score: score,
    itemsCollected: window.__signals__.itemsCollected,
    remainingItems: window.__signals__.totalItems - window.__signals__.itemsCollected,
    timestamp: Date.now()
  }));

  // 检查是否收集完所有物品
  if (window.__signals__.itemsCollected >= window.__signals__.totalItems) {
    console.log(JSON.stringify({
      event: 'all_items_collected',
      finalScore: score,
      timestamp: Date.now()
    }));
    
    // 显示完成提示
    const completeText = this.add.text(400, 300, 'All Items Collected!\nFinal Score: ' + score, {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    completeText.setOrigin(0.5);
  }
}

function updateSignals() {
  window.__signals__.score = score;
  window.__signals__.itemsCollected = 0;
  window.__signals__.playerX = 400;
  window.__signals__.playerY = 300;
}

// 启动游戏
new Phaser.Game(config);