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

  // 创建平台纹理（灰色矩形）
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x666666, 1);
  platformGraphics.fillRect(0, 0, 200, 20);
  platformGraphics.generateTexture('platform', 200, 20);
  platformGraphics.destroy();

  // 创建金币纹理（黄色圆形）
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xffdd00, 1);
  coinGraphics.fillCircle(16, 16, 16);
  coinGraphics.lineStyle(2, 0xffaa00, 1);
  coinGraphics.strokeCircle(16, 16, 16);
  coinGraphics.generateTexture('coin', 32, 32);
  coinGraphics.destroy();
}

function create() {
  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#fff',
    fontFamily: 'Arial'
  });
  scoreText.setDepth(10);

  // 创建平台组
  platforms = this.physics.add.staticGroup();

  // 地面平台
  platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();

  // 中间平台
  platforms.create(600, 450, 'platform');
  platforms.create(200, 450, 'platform');
  platforms.create(400, 350, 'platform');
  platforms.create(100, 250, 'platform');
  platforms.create(700, 250, 'platform');
  platforms.create(400, 150, 'platform');

  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 玩家与平台碰撞
  this.physics.add.collider(player, platforms);

  // 创建金币组
  coins = this.physics.add.group({
    key: 'coin',
    repeat: 9, // 创建10个金币
    setXY: { x: 0, y: 0 }
  });

  // 手动设置金币位置（分布在各个平台上方）
  const coinPositions = [
    { x: 600, y: 400 },
    { x: 200, y: 400 },
    { x: 400, y: 300 },
    { x: 100, y: 200 },
    { x: 700, y: 200 },
    { x: 400, y: 100 },
    { x: 300, y: 500 },
    { x: 500, y: 500 },
    { x: 150, y: 350 },
    { x: 650, y: 350 }
  ];

  coins.children.entries.forEach((coin, index) => {
    coin.setPosition(coinPositions[index].x, coinPositions[index].y);
    coin.setBounce(0.3);
    coin.setCollideWorldBounds(true);
  });

  // 金币与平台碰撞
  this.physics.add.collider(coins, platforms);

  // 玩家与金币重叠检测
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
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

  // 跳跃控制（只有在地面或平台上才能跳跃）
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }
}

function collectCoin(player, coin) {
  // 移除金币
  coin.disableBody(true, true);

  // 增加分数
  score += 10;
  scoreText.setText('Score: ' + score);

  // 检查是否收集完所有金币
  if (score === 100) {
    scoreText.setText('Score: ' + score + ' - YOU WIN!');
    scoreText.setStyle({ fill: '#00ff00' });
  }
}

const game = new Phaser.Game(config);