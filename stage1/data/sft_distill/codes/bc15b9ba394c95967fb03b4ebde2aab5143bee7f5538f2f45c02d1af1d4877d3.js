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
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建可收集物品纹理（青色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x00ffff, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setVelocityDrag(500);

  // 创建可收集物品组
  collectibles = this.physics.add.group();

  // 生成15个可收集物品，随机分布
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(15); // 设置圆形碰撞体
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
  scoreText.setDepth(1);

  // 添加提示文本
  this.add.text(400, 30, 'Use Arrow Keys to Move and Collect Cyan Circles!', {
    fontSize: '20px',
    fill: '#ffff00',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
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
  // 销毁被收集的物品
  collectible.destroy();

  // 增加分数
  score += 10;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 检查是否收集完所有物品
  if (collectibles.countActive(true) === 0) {
    // 显示胜利文本
    const winText = this.add.text(400, 300, 'YOU WIN!\nAll items collected!', {
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

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态供验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { score, game };
}