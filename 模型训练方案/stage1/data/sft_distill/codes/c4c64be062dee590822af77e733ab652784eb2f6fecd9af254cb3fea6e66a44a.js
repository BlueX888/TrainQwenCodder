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
let winText;
let gameWon = false;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建可收集物纹理
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0xffff00, 1);
  collectibleGraphics.fillRect(0, 0, 30, 30);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建可收集物理组
  collectibles = this.physics.add.group();

  // 随机生成8个可收集物
  for (let i = 0; i < totalCollectibles; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCollideWorldBounds(true);
    
    // 添加轻微的随机移动效果
    collectible.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    collectible.setBounce(1);
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

  // 创建通关文本（初始隐藏）
  winText = this.add.text(400, 300, '恭喜通关！', {
    fontSize: '48px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 6
  });
  winText.setOrigin(0.5);
  winText.setVisible(false);
}

function update() {
  if (gameWon) {
    // 游戏胜利后停止玩家移动
    player.setVelocity(0);
    return;
  }

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
  // 移除被收集的物品
  collectible.destroy();
  
  // 增加收集计数
  collectedCount++;
  
  // 更新分数文本
  scoreText.setText(`收集进度: ${collectedCount}/${totalCollectibles}`);
  
  // 检查是否收集完所有物品
  if (collectedCount >= totalCollectibles) {
    gameWon = true;
    winText.setVisible(true);
    
    // 添加胜利动画效果
    this.tweens.add({
      targets: winText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      repeat: -1,
      duration: 500
    });
  }
}

// 启动游戏
const game = new Phaser.Game(config);