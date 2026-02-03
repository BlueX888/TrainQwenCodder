const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
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
let platforms;
let coins;
let cursors;
let score = 0;
let scoreText;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理（绿色矩形）
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00ff00, 1);
  platformGraphics.fillRect(0, 0, 200, 20);
  platformGraphics.generateTexture('platform', 200, 20);
  platformGraphics.destroy();

  // 创建金币纹理（黄色圆形）
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xffff00, 1);
  coinGraphics.fillCircle(16, 16, 16);
  coinGraphics.lineStyle(2, 0xffaa00, 1);
  coinGraphics.strokeCircle(16, 16, 16);
  coinGraphics.generateTexture('coin', 32, 32);
  coinGraphics.destroy();
}

function create() {
  // 创建静态平台组
  platforms = this.physics.add.staticGroup();

  // 地面平台
  platforms.create(200, 580, 'platform').setScale(2, 1).refreshBody();
  platforms.create(600, 580, 'platform').setScale(2, 1).refreshBody();

  // 空中平台
  platforms.create(600, 450, 'platform');
  platforms.create(50, 350, 'platform');
  platforms.create(750, 300, 'platform');
  platforms.create(400, 200, 'platform');

  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 玩家与平台碰撞
  this.physics.add.collider(player, platforms);

  // 创建金币组
  coins = this.physics.add.group();

  // 在空中平台附近创建3个金币
  coins.create(600, 380, 'coin');
  coins.create(50, 280, 'coin');
  coins.create(400, 130, 'coin');

  // 金币物理属性
  coins.children.iterate((coin) => {
    coin.setBounce(0.3);
    coin.setCollideWorldBounds(true);
  });

  // 金币与平台碰撞
  this.physics.add.collider(coins, platforms);

  // 玩家收集金币
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示分数
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#fff',
    fontFamily: 'Arial',
    stroke: '#000',
    strokeThickness: 4
  });
}

function update() {
  // 左右移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃控制（只有在地面或平台上才能跳）
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }
}

function collectCoin(player, coin) {
  // 销毁金币
  coin.disableBody(true, true);

  // 增加分数
  score += 10;
  scoreText.setText('Score: ' + score);

  // 检查是否收集完所有金币
  if (coins.countActive(true) === 0) {
    // 游戏胜利提示
    const winText = this.add.text(400, 300, 'YOU WIN!', {
      fontSize: '64px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6
    });
    winText.setOrigin(0.5);
  }
}

// 启动游戏
new Phaser.Game(config);