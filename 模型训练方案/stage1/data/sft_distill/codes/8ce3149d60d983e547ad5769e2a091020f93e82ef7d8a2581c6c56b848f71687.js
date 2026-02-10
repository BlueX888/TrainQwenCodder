const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
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
let scoreText;
let score = 0;

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x8b4513, 1);
  platformGraphics.fillRect(0, 0, 200, 20);
  platformGraphics.generateTexture('platform', 200, 20);
  platformGraphics.destroy();

  // 创建金币纹理
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xffd700, 1);
  coinGraphics.fillCircle(12, 12, 12);
  coinGraphics.generateTexture('coin', 24, 24);
  coinGraphics.destroy();
}

function create() {
  // 创建平台组
  platforms = this.physics.add.staticGroup();

  // 地面平台
  platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();

  // 空中平台
  platforms.create(150, 450, 'platform');
  platforms.create(450, 380, 'platform');
  platforms.create(650, 300, 'platform');
  platforms.create(250, 250, 'platform');
  platforms.create(550, 180, 'platform');
  platforms.create(100, 150, 'platform');

  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 玩家与平台碰撞
  this.physics.add.collider(player, platforms);

  // 创建金币组
  coins = this.physics.add.group();

  // 创建15个金币，分布在不同位置
  const coinPositions = [
    { x: 150, y: 400 },
    { x: 200, y: 380 },
    { x: 450, y: 330 },
    { x: 500, y: 310 },
    { x: 650, y: 250 },
    { x: 700, y: 230 },
    { x: 250, y: 200 },
    { x: 300, y: 180 },
    { x: 550, y: 130 },
    { x: 600, y: 110 },
    { x: 100, y: 100 },
    { x: 150, y: 80 },
    { x: 400, y: 200 },
    { x: 350, y: 280 },
    { x: 750, y: 350 }
  ];

  coinPositions.forEach(pos => {
    const coin = coins.create(pos.x, pos.y, 'coin');
    coin.setBounce(0.2);
    coin.setCollideWorldBounds(true);
  });

  // 金币与平台碰撞
  this.physics.add.collider(coins, platforms);

  // 玩家收集金币
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4
  });
}

function update() {
  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃（只有在地面或平台上才能跳）
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
    scoreText.setText('Score: ' + score + ' - YOU WIN!');
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);