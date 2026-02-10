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
  // 生成玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 生成收集物纹理（蓝色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x0099ff, 1);
  collectibleGraphics.fillCircle(12, 12, 12);
  collectibleGraphics.generateTexture('collectible', 24, 24);
  collectibleGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建收集物物理组
  collectibles = this.physics.add.group();

  // 随机生成8个收集物
  for (let i = 0; i < 8; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(12); // 设置圆形碰撞体
  }

  // 设置玩家与收集物的重叠检测
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
  this.add.text(400, 550, 'Use Arrow Keys to Move and Collect Blue Circles', {
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
  if (score >= 8 && collectibles.countActive(true) === 0) {
    scoreText.setText('Score: ' + score + ' - ALL COLLECTED!');
  }
}

function collectItem(player, collectible) {
  // 销毁收集物
  collectible.disableBody(true, true);

  // 增加分数
  score += 10;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 添加收集音效反馈（使用粒子效果替代）
  const particles = this.add.particles(collectible.x, collectible.y, 'collectible', {
    speed: { min: 50, max: 150 },
    scale: { start: 0.5, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 300,
    quantity: 8,
    blendMode: 'ADD'
  });

  // 300ms后销毁粒子发射器
  this.time.delayedCall(300, () => {
    particles.destroy();
  });
}

// 创建游戏实例
const game = new Phaser.Game(config);