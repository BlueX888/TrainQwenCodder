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
  createTextures.call(this);
}

function createTextures() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建收集物纹理（红色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0xff0000, 1);
  collectibleGraphics.fillCircle(12, 12, 12);
  collectibleGraphics.generateTexture('collectible', 24, 24);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.8);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 随机生成 10 个收集物
  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(12); // 设置圆形碰撞体
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
  this.add.text(400, 16, 'Use Arrow Keys to Move and Collect Red Circles', {
    fontSize: '16px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5, 0);
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

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 如果所有收集物都被收集完
  if (collectibles.countActive(true) === 0) {
    // 显示胜利信息
    const winText = this.add.text(400, 300, 'YOU WIN!\nScore: ' + score, {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    winText.setOrigin(0.5);

    // 停止玩家移动
    player.setVelocity(0, 0);
    cursors = null;
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证状态（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, getScore: () => score };
}