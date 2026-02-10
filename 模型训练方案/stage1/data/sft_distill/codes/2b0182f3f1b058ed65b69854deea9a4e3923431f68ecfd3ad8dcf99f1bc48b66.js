// 完整的 Phaser3 收集物品游戏代码
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
  // 不需要加载外部资源，使用 Graphics 生成纹理
}

function create() {
  // 重置分数
  score = 0;

  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0099ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建收集物纹理（橙色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0xff9900, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 在随机位置生成 3 个收集物
  const positions = [
    { x: 150, y: 150 },
    { x: 650, y: 450 },
    { x: 400, y: 100 }
  ];

  positions.forEach(pos => {
    const collectible = collectibles.create(pos.x, pos.y, 'collectible');
    collectible.setCircle(15); // 设置圆形碰撞体
  });

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 添加游戏说明文本
  this.add.text(16, 560, 'Use Arrow Keys to Move and Collect Orange Circles', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });
}

function update() {
  // 玩家移动逻辑
  const speed = 200;

  // 重置速度
  player.setVelocity(0);

  // 检测方向键输入
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

  // 对角线移动速度归一化
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.setVelocity(
      player.body.velocity.x * 0.707,
      player.body.velocity.y * 0.707
    );
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

  // 检查是否收集完所有物品
  if (collectibles.countActive(true) === 0) {
    // 显示胜利文本
    const winText = this.add.text(400, 300, 'You Win!\nScore: ' + score, {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    winText.setOrigin(0.5);

    // 停止玩家移动
    player.setVelocity(0);
    cursors = null;
  }

  // 输出状态到控制台（可验证）
  console.log('Score:', score, 'Remaining:', collectibles.countActive(true));
}

// 启动游戏
const game = new Phaser.Game(config);