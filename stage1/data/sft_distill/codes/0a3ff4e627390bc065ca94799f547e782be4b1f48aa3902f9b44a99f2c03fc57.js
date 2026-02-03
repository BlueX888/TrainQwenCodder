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

// 初始化 signals 用于验证
window.__signals__ = {
  score: 0,
  collected: 0,
  totalCollectibles: 8
};

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x4a90e2, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建可收集物纹理（灰色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x808080, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(40, 40);

  // 创建可收集物组
  collectibles = this.physics.add.group();

  // 随机生成 8 个可收集物体
  const positions = [];
  for (let i = 0; i < 8; i++) {
    let x, y;
    let validPosition = false;
    
    // 确保不与玩家初始位置重叠，且物体之间有足够间距
    while (!validPosition) {
      x = Phaser.Math.Between(50, 750);
      y = Phaser.Math.Between(50, 550);
      
      // 检查与玩家的距离
      const distToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
      if (distToPlayer < 100) continue;
      
      // 检查与其他物体的距离
      validPosition = true;
      for (let pos of positions) {
        const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
        if (dist < 80) {
          validPosition = false;
          break;
        }
      }
    }
    
    positions.push({ x, y });
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(15); // 设置圆形碰撞体
    collectible.body.setOffset(0, 0);
  }

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

  // 添加说明文本
  this.add.text(16, 560, 'Use Arrow Keys to move and collect gray circles', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });

  console.log(JSON.stringify({
    event: 'game_start',
    totalCollectibles: 8,
    score: 0
  }));
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
  collectedCount++;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 更新 signals
  window.__signals__.score = score;
  window.__signals__.collected = collectedCount;

  // 输出日志
  console.log(JSON.stringify({
    event: 'item_collected',
    score: score,
    collected: collectedCount,
    remaining: 8 - collectedCount
  }));

  // 检查是否收集完所有物品
  if (collectedCount === 8) {
    console.log(JSON.stringify({
      event: 'game_complete',
      finalScore: score,
      collected: collectedCount
    }));

    // 显示完成信息
    const completeText = this.add.text(400, 300, 'All Collected!\nFinal Score: ' + score, {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    completeText.setOrigin(0.5);
  }
}

new Phaser.Game(config);