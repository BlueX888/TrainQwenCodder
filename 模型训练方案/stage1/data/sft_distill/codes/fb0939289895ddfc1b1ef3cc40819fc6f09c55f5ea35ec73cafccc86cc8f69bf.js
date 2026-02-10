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
let collectibles;
let cursors;
let collectedCount = 0;
let totalCollectibles = 8;
let scoreText;
let victoryText;
let gameOver = false;

function preload() {
  // 创建玩家纹理（蓝色矩形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建收集物纹理（黄色矩形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0xffdd00, 1);
  collectibleGraphics.fillRect(0, 0, 30, 30);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setVelocityDrag(500);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 随机生成 8 个收集物
  for (let i = 0; i < totalCollectibles; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCollideWorldBounds(true);
    
    // 添加轻微的浮动效果
    this.tweens.add({
      targets: collectible,
      y: collectible.y + 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, `收集进度: ${collectedCount}/${totalCollectibles}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建胜利文本（初始隐藏）
  victoryText = this.add.text(400, 300, '恭喜通关！', {
    fontSize: '64px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  victoryText.setOrigin(0.5);
  victoryText.setVisible(false);

  // 添加游戏说明
  this.add.text(16, 50, '使用方向键移动，收集所有黄色方块', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });
}

function update() {
  if (gameOver) {
    return;
  }

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
  // 移除收集物
  collectible.destroy();

  // 增加收集计数
  collectedCount++;

  // 更新分数文本
  scoreText.setText(`收集进度: ${collectedCount}/${totalCollectibles}`);

  // 检查是否收集完成
  if (collectedCount >= totalCollectibles) {
    gameOver = true;
    victoryText.setVisible(true);
    player.setVelocity(0, 0);

    // 添加胜利动画效果
    this.tweens.add({
      targets: victoryText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}

// 启动游戏
const game = new Phaser.Game(config);