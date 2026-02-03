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

  // 创建可收集物体纹理（紫色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x9b59b6, 1);
  collectibleGraphics.fillCircle(12, 12, 12);
  collectibleGraphics.generateTexture('collectible', 24, 24);
  collectibleGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建可收集物体组
  collectibles = this.physics.add.group();

  // 随机生成10个可收集物体
  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCollideWorldBounds(true);
    
    // 添加轻微的浮动动画效果
    this.tweens.add({
      targets: collectible,
      y: collectible.y + 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // 添加碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  scoreText.setDepth(1);

  // 添加游戏说明文本
  const instructionText = this.add.text(400, 550, 'Use Arrow Keys to Move and Collect Purple Items', {
    fontSize: '18px',
    fill: '#cccccc',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);
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
  // 物体消失
  collectible.disableBody(true, true);

  // 增加分数
  score += 10;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 添加收集音效替代（使用视觉反馈）
  const collectEffect = this.add.graphics();
  collectEffect.fillStyle(0xffff00, 0.8);
  collectEffect.fillCircle(collectible.x, collectible.y, 20);
  
  this.tweens.add({
    targets: collectEffect,
    alpha: 0,
    scale: 2,
    duration: 300,
    onComplete: () => {
      collectEffect.destroy();
    }
  });

  // 检查是否收集完所有物体
  if (collectibles.countActive(true) === 0) {
    const winText = this.add.text(400, 300, 'YOU WIN!\nScore: ' + score, {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center'
    });
    winText.setOrigin(0.5);
    
    // 停止玩家移动
    player.setVelocity(0, 0);
    cursors = null;
  }
}

// 启动游戏
const game = new Phaser.Game(config);

// 导出分数供验证使用
window.getGameScore = () => score;
window.getCollectiblesCount = () => collectibles ? collectibles.countActive(true) : 0;