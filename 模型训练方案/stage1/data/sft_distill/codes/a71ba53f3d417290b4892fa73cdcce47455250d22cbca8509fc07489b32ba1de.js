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
  },
  backgroundColor: '#87CEEB'
};

let player;
let platforms;
let coins;
let cursors;
let score = 0;
let scoreText;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理（绿色矩形）
  const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  platformGraphics.fillStyle(0x00ff00, 1);
  platformGraphics.fillRect(0, 0, 200, 32);
  platformGraphics.generateTexture('platform', 200, 32);
  platformGraphics.destroy();

  // 创建金币纹理（黄色圆形）
  const coinGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  coinGraphics.fillStyle(0xffff00, 1);
  coinGraphics.fillCircle(16, 16, 16);
  coinGraphics.lineStyle(2, 0xffa500, 1);
  coinGraphics.strokeCircle(16, 16, 16);
  coinGraphics.generateTexture('coin', 32, 32);
  coinGraphics.destroy();
}

function create() {
  // 初始化分数
  score = 0;

  // 创建平台组（静态物理组）
  platforms = this.physics.add.staticGroup();

  // 创建地面平台
  platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();

  // 创建空中平台
  platforms.create(150, 450, 'platform');
  platforms.create(650, 400, 'platform');
  platforms.create(400, 300, 'platform');
  platforms.create(100, 250, 'platform');
  platforms.create(700, 200, 'platform');

  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 玩家与平台碰撞
  this.physics.add.collider(player, platforms);

  // 创建金币组
  coins = this.physics.add.group();

  // 在平台附近生成8个金币
  const coinPositions = [
    { x: 150, y: 380 },
    { x: 650, y: 330 },
    { x: 400, y: 230 },
    { x: 100, y: 180 },
    { x: 700, y: 130 },
    { x: 300, y: 500 },
    { x: 500, y: 350 },
    { x: 600, y: 250 }
  ];

  coinPositions.forEach(pos => {
    const coin = coins.create(pos.x, pos.y, 'coin');
    coin.setBounce(0.3);
    coin.setCollideWorldBounds(true);
  });

  // 金币与平台碰撞
  this.physics.add.collider(coins, platforms);

  // 玩家收集金币
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#000',
    fontStyle: 'bold'
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
  if (score === 80) {
    scoreText.setText('Score: ' + score + ' - YOU WIN!');
    scoreText.setStyle({ fill: '#ff0000' });
  }
}

// 启动游戏
const game = new Phaser.Game(config);