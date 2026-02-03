// 完整的 Phaser3 收集物品游戏代码
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
let collectibles;
let cursors;
let scoreText;
let score = 0;
let collectedCount = 0;

// 初始化信号对象
window.__signals__ = {
  score: 0,
  collectedCount: 0,
  totalCollectibles: 8,
  gameComplete: false
};

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x3498db, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建收集物纹理（绿色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x2ecc71, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setVelocityDrag(500);

  // 创建收集物品组
  collectibles = this.physics.add.group();

  // 生成8个收集物，随机分布
  const positions = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 100, y: 500 },
    { x: 700, y: 500 },
    { x: 400, y: 100 },
    { x: 400, y: 500 },
    { x: 200, y: 300 },
    { x: 600, y: 300 }
  ];

  positions.forEach(pos => {
    const collectible = collectibles.create(pos.x, pos.y, 'collectible');
    collectible.setCircle(15); // 设置圆形碰撞体
    collectible.body.setOffset(0, 0);
  });

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 添加提示文本
  this.add.text(400, 550, 'Use Arrow Keys to Move and Collect Green Circles', {
    fontSize: '18px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);

  console.log('Game started - Collect all 8 green circles!');
}

function update() {
  // 玩家移动控制
  const speed = 300;

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

  // 更新信号状态
  window.__signals__.score = score;
  window.__signals__.collectedCount = collectedCount;
}

function collectItem(player, collectible) {
  // 销毁收集物
  collectible.destroy();

  // 增加分数
  score += 10;
  collectedCount += 1;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 更新信号
  window.__signals__.score = score;
  window.__signals__.collectedCount = collectedCount;

  // 输出日志
  console.log(JSON.stringify({
    event: 'item_collected',
    score: score,
    collectedCount: collectedCount,
    remaining: 8 - collectedCount
  }));

  // 检查是否收集完所有物品
  if (collectedCount === 8) {
    window.__signals__.gameComplete = true;
    console.log(JSON.stringify({
      event: 'game_complete',
      finalScore: score,
      message: 'Congratulations! All items collected!'
    }));

    // 显示完成提示
    const completeText = this.add.text(400, 300, 'ALL COLLECTED!\nFinal Score: ' + score, {
      fontSize: '48px',
      fill: '#2ecc71',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 停止玩家移动
    player.setVelocity(0, 0);
  }
}

// 启动游戏
new Phaser.Game(config);