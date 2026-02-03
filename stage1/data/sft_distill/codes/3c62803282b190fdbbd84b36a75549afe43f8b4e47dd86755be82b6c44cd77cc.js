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
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x0080ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建可收集物体纹理（黄色圆形）
  const collectibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  collectibleGraphics.fillStyle(0xffff00, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDrag(500);
  player.setMaxVelocity(300);

  // 创建可收集物体组
  collectibles = this.physics.add.group();

  // 生成 15 个随机位置的可收集物体
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(15); // 设置圆形碰撞体
    collectible.body.setOffset(0, 0);
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数显示文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  scoreText.setDepth(10);

  // 添加提示文本
  this.add.text(400, 30, 'Use Arrow Keys to Move and Collect Yellow Items!', {
    fontSize: '18px',
    fill: '#ffff00',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update() {
  // 玩家移动控制
  const acceleration = 600;

  if (cursors.left.isDown) {
    player.setAccelerationX(-acceleration);
  } else if (cursors.right.isDown) {
    player.setAccelerationX(acceleration);
  } else {
    player.setAccelerationX(0);
  }

  if (cursors.up.isDown) {
    player.setAccelerationY(-acceleration);
  } else if (cursors.down.isDown) {
    player.setAccelerationY(acceleration);
  } else {
    player.setAccelerationY(0);
  }

  // 检查是否收集完所有物体
  if (score === 15 && collectibles.countActive(true) === 0) {
    scoreText.setText('Score: ' + score + ' - ALL COLLECTED!');
  }
}

function collectItem(player, collectible) {
  // 销毁被收集的物体
  collectible.destroy();

  // 增加分数
  score += 1;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 添加收集特效（缩放动画）
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });

  // 输出状态到控制台便于验证
  console.log('Item collected! Current score:', score);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证状态
if (typeof window !== 'undefined') {
  window.getGameState = function() {
    return {
      score: score,
      remainingItems: collectibles ? collectibles.countActive(true) : 15,
      totalItems: 15
    };
  };
}