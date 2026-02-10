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
  // 创建玩家纹理（红色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xff0000, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建可收集物纹理（青色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x00ffff, 1);
  collectibleGraphics.fillCircle(12, 12, 12);
  collectibleGraphics.generateTexture('collectible', 24, 24);
  collectibleGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建可收集物理组
  collectibles = this.physics.add.group();

  // 随机生成 20 个可收集物体
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(12); // 设置圆形碰撞体
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();
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
}

// 收集物品回调函数
function collectItem(player, collectible) {
  // 移除被收集的物体
  collectible.disableBody(true, true);

  // 增加分数
  score += 10;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 检查是否收集完所有物品
  if (collectibles.countActive(true) === 0) {
    scoreText.setText('Score: ' + score + ' - All Collected!');
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出可验证的状态信号
if (typeof window !== 'undefined') {
  window.getGameState = function() {
    return {
      score: score,
      remainingCollectibles: collectibles ? collectibles.countActive(true) : 20,
      playerPosition: player ? { x: player.x, y: player.y } : null
    };
  };
}