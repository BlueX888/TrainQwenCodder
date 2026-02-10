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
  // 使用Graphics创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 使用Graphics创建收集物纹理（紫色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x9966ff, 1);
  collectibleGraphics.fillCircle(16, 16, 16);
  collectibleGraphics.generateTexture('collectible', 32, 32);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setVelocity(0, 0);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 生成10个紫色收集物，随机分布
  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(16); // 设置圆形碰撞体
  }

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测回调
  this.physics.add.overlap(player, collectibles, collectItem, null, this);
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

// 收集物品回调函数
function collectItem(player, collectible) {
  // 销毁收集物
  collectible.destroy();

  // 增加分数
  score += 10;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 如果所有收集物都被收集，显示胜利信息
  if (collectibles.countActive(true) === 0) {
    const winText = this.add.text(400, 300, 'You Win!', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
    winText.setOrigin(0.5);
  }
}

// 启动游戏
new Phaser.Game(config);