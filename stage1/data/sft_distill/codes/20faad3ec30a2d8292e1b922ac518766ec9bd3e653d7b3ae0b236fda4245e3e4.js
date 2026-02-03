// 游戏配置
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

// 全局变量
let player;
let collectibles;
let cursors;
let scoreText;
let score = 0;

function preload() {
  // 使用 Graphics 创建玩家纹理（绿色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 使用 Graphics 创建可收集物体纹理（紫色圆形）
  const collectibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  collectibleGraphics.fillStyle(0x9b59b6, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setVelocity(0, 0);

  // 创建可收集物体组
  collectibles = this.physics.add.group();

  // 生成3个紫色可收集物体，随机位置
  const positions = [
    { x: 150, y: 150 },
    { x: 650, y: 150 },
    { x: 400, y: 450 }
  ];

  positions.forEach(pos => {
    const collectible = collectibles.create(pos.x, pos.y, 'collectible');
    collectible.setCollideWorldBounds(true);
    // 添加轻微的浮动效果
    this.tweens.add({
      targets: collectible,
      y: pos.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  });

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文本
  this.add.text(400, 550, 'Use Arrow Keys to Move and Collect Purple Items', {
    fontSize: '18px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update() {
  // 重置玩家速度
  player.setVelocity(0);

  // 键盘控制
  const speed = 200;

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

  // 对角线移动时归一化速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(speed);
  }
}

// 收集物品的回调函数
function collectItem(player, collectible) {
  // 销毁可收集物体
  collectible.destroy();

  // 增加分数
  score += 10;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 检查是否收集完所有物品
  if (collectibles.countActive(true) === 0) {
    // 显示胜利文本
    const winText = this.add.text(400, 300, 'You Win!\nAll Items Collected!', {
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
const game = new Phaser.Game(config);