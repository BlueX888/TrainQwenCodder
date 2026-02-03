// 完整的 Phaser3 收集物品游戏
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
let score = 0;
let scoreText;
let cursors;
let collectedCount = 0;

// 初始化信号对象
window.__signals__ = {
  score: 0,
  collectedCount: 0,
  totalCollectibles: 20,
  gameComplete: false
};

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

  // 创建收集物纹理（紫色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x9945ff, 1);
  collectibleGraphics.fillCircle(12, 12, 12);
  collectibleGraphics.generateTexture('collectible', 24, 24);
  collectibleGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建收集物品组
  collectibles = this.physics.add.group();

  // 随机生成 20 个收集物
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(12); // 设置圆形碰撞体
  }

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 添加收集提示文本
  this.add.text(16, 56, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 初始化信号
  updateSignals();

  console.log('Game Started:', JSON.stringify(window.__signals__));
}

function update() {
  // 玩家移动控制
  const speed = 200;

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

function collectItem(player, collectible) {
  // 销毁收集物
  collectible.destroy();

  // 增加分数
  score += 10;
  collectedCount += 1;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 更新信号
  updateSignals();

  // 输出日志
  console.log('Item Collected:', JSON.stringify(window.__signals__));

  // 检查是否收集完所有物品
  if (collectedCount === 20) {
    window.__signals__.gameComplete = true;
    console.log('Game Complete!', JSON.stringify(window.__signals__));
    
    // 显示完成信息
    const completeText = this.add.text(400, 300, 'All Items Collected!\nScore: ' + score, {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    completeText.setOrigin(0.5);
  }
}

function updateSignals() {
  window.__signals__.score = score;
  window.__signals__.collectedCount = collectedCount;
  window.__signals__.remainingCollectibles = 20 - collectedCount;
  window.__signals__.gameComplete = collectedCount === 20;
}

// 启动游戏
const game = new Phaser.Game(config);