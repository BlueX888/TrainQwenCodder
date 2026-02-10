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

  // 创建可收集物体纹理（紫色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0x9b59b6, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setVelocityDrag(500);

  // 创建可收集物体组
  collectibles = this.physics.add.group();

  // 生成10个可收集物体，随机分布
  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(15); // 设置圆形碰撞体
  }

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 添加提示文本
  this.add.text(400, 550, 'Use Arrow Keys to Move and Collect Purple Items', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update() {
  // 重置玩家速度
  player.setVelocity(0);

  // 键盘控制
  const speed = 300;
  
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

function collectItem(player, collectible) {
  // 销毁收集物体
  collectible.destroy();

  // 增加分数
  score += 10;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 检查是否收集完所有物体
  if (collectibles.countActive(true) === 0) {
    // 显示胜利文本
    this.add.text(400, 300, 'You Win!\nScore: ' + score, {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 停止玩家移动
    player.setVelocity(0);
    cursors = null;
  }
}

// 启动游戏
new Phaser.Game(config);