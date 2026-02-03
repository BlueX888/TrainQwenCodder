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
  // 创建玩家纹理（绿色矩形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建收集物纹理（白色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0xffffff, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 生成3个收集物，随机位置
  const positions = [
    { x: 200, y: 150 },
    { x: 600, y: 450 },
    { x: 400, y: 100 }
  ];

  positions.forEach(pos => {
    const collectible = collectibles.create(pos.x, pos.y, 'collectible');
    collectible.setCollideWorldBounds(true);
    // 添加轻微漂浮动画
    this.tweens.add({
      targets: collectible,
      y: collectible.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  });

  // 添加碰撞检测
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
  this.add.text(400, 550, 'Use Arrow Keys to Move and Collect White Circles', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update() {
  // 玩家移动控制
  const speed = 200;

  player.setVelocity(0);

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
  if (score === 3 && collectibles.countActive(true) === 0) {
    scoreText.setText('Score: ' + score + ' - All Collected!');
  }
}

function collectItem(player, collectible) {
  // 销毁收集物
  collectible.destroy();

  // 增加分数
  score += 1;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 添加收集特效（简单的粒子效果）
  const particle = this.add.graphics();
  particle.fillStyle(0xffffff, 1);
  particle.fillCircle(collectible.x, collectible.y, 5);

  this.tweens.add({
    targets: particle,
    alpha: 0,
    scale: 3,
    duration: 500,
    onComplete: () => {
      particle.destroy();
    }
  });
}

// 创建游戏实例
const game = new Phaser.Game(config);