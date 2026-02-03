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
  // 使用 Graphics 生成纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建收集物纹理（蓝色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x0099ff, 1);
  collectibleGraphics.fillCircle(16, 16, 16);
  collectibleGraphics.generateTexture('collectible', 32, 32);
  collectibleGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建收集物物理组
  collectibles = this.physics.add.group();

  // 随机生成8个收集物
  for (let i = 0; i < 8; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCollideWorldBounds(true);
    
    // 给收集物添加轻微的随机移动
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
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 添加提示文本
  this.add.text(400, 16, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    fill: '#cccccc',
    fontFamily: 'Arial'
  }).setOrigin(0.5, 0);
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

  // 检查是否所有收集物都被收集
  if (collectibles.countActive(true) === 0) {
    scoreText.setText('Score: ' + score + ' - All Collected!');
  }
}

function collectItem(player, collectible) {
  // 收集物消失
  collectible.disableBody(true, true);
  
  // 增加分数
  score += 10;
  scoreText.setText('Score: ' + score);
  
  // 播放简单的视觉反馈（缩放效果）
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true
  });
}

// 创建游戏实例
const game = new Phaser.Game(config);