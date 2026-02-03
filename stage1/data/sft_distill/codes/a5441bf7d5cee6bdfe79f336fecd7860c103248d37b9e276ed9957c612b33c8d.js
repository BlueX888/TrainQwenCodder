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
  // 不需要加载外部资源
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
  collectibleGraphics.fillStyle(0x0088ff, 1);
  collectibleGraphics.fillCircle(12, 12, 12);
  collectibleGraphics.generateTexture('collectible', 24, 24);
  collectibleGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 生成 15 个随机位置的收集物
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(12); // 设置圆形碰撞体
  }

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
  this.add.text(400, 550, 'Use Arrow Keys to Move and Collect Blue Items', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
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

  // 检查是否收集完所有物品
  if (collectibles.countActive(true) === 0 && score === 15) {
    scoreText.setText('Score: ' + score + ' - ALL COLLECTED!');
  }
}

function collectItem(player, collectible) {
  // 销毁收集物
  collectible.disableBody(true, true);

  // 增加分数
  score += 1;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 可验证的状态信号
  console.log('Item collected! Current score:', score);
}

// 启动游戏
const game = new Phaser.Game(config);