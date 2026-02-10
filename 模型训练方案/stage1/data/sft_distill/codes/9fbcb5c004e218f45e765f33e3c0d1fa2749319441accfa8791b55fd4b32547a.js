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

// 初始化验证信号
window.__signals__ = {
  score: 0,
  collected: 0,
  remaining: 8,
  gameStarted: false,
  gameCompleted: false
};

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建收集物纹理（灰色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x808080, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setVelocityDrag(500);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 生成 8 个随机位置的收集物
  const positions = [];
  for (let i = 0; i < 8; i++) {
    let x, y;
    let validPosition = false;
    
    // 确保收集物不会生成在玩家附近或重叠
    while (!validPosition) {
      x = Phaser.Math.Between(50, 750);
      y = Phaser.Math.Between(50, 550);
      
      // 检查是否离玩家太近
      const distToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
      if (distToPlayer < 100) continue;
      
      // 检查是否与其他收集物重叠
      let overlap = false;
      for (let pos of positions) {
        const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
        if (dist < 60) {
          overlap = true;
          break;
        }
      }
      
      if (!overlap) {
        validPosition = true;
        positions.push({ x, y });
      }
    }
    
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(15); // 设置圆形碰撞体
    collectible.body.setAllowGravity(false);
  }

  // 设置玩家与收集物的碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建分数显示
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4
  });
  scoreText.setDepth(100);

  // 添加提示文本
  const instructionText = this.add.text(400, 560, 'Use Arrow Keys to Move and Collect Gray Circles', {
    fontSize: '18px',
    fill: '#cccccc',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 更新验证信号
  window.__signals__.gameStarted = true;
  window.__signals__.remaining = 8;
  
  console.log('[GAME_START]', JSON.stringify(window.__signals__));
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
}

function collectItem(player, collectible) {
  // 销毁收集物
  collectible.destroy();
  
  // 增加分数
  score += 10;
  scoreText.setText('Score: ' + score);
  
  // 更新验证信号
  window.__signals__.score = score;
  window.__signals__.collected += 1;
  window.__signals__.remaining = collectibles.countActive(true);
  
  console.log('[ITEM_COLLECTED]', JSON.stringify({
    score: score,
    collected: window.__signals__.collected,
    remaining: window.__signals__.remaining,
    position: { x: Math.round(collectible.x), y: Math.round(collectible.y) }
  }));
  
  // 检查是否收集完所有物品
  if (collectibles.countActive(true) === 0) {
    window.__signals__.gameCompleted = true;
    
    // 显示完成提示
    const completeText = this.add.text(400, 300, 'ALL COLLECTED!\nFinal Score: ' + score, {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    completeText.setOrigin(0.5);
    
    console.log('[GAME_COMPLETE]', JSON.stringify(window.__signals__));
    
    // 停止玩家移动
    player.setVelocity(0, 0);
  }
}

// 启动游戏
new Phaser.Game(config);