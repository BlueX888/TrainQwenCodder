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
let cursors;
let score = 0;
let scoreText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建收集物纹理（橙色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0xff8800, 1);
  collectibleGraphics.fillCircle(12, 12, 12);
  collectibleGraphics.generateTexture('collectible', 24, 24);
  collectibleGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(32, 32);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 随机生成10个收集物
  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.body.setSize(24, 24);
    collectible.setCollideWorldBounds(true);
    
    // 添加轻微的随机移动效果
    collectible.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    collectible.setBounce(1, 1);
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文本
  this.add.text(16, 560, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });
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

  // 检查是否收集完所有物品
  if (collectibles.countActive(true) === 0 && score > 0) {
    scoreText.setText('Score: ' + score + ' - ALL COLLECTED!');
  }
}

function collectItem(player, collectible) {
  // 销毁收集物
  collectible.destroy();
  
  // 增加分数
  score += 10;
  
  // 更新分数显示
  scoreText.setText('Score: ' + score);
  
  // 可选：添加视觉反馈
  const flash = this.add.graphics();
  flash.fillStyle(0xffff00, 0.5);
  flash.fillCircle(collectible.x, collectible.y, 30);
  this.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 300,
    onComplete: () => flash.destroy()
  });
}

// 启动游戏
const game = new Phaser.Game(config);

// 暴露 score 变量用于验证
window.gameState = {
  getScore: () => score,
  getCollectiblesRemaining: () => collectibles ? collectibles.countActive(true) : 0
};