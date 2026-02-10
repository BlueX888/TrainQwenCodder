const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
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
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00ff00, 1);
  platformGraphics.fillRect(0, 0, 200, 20);
  platformGraphics.generateTexture('platform', 200, 20);
  platformGraphics.destroy();

  // 创建金币纹理
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xffff00, 1);
  coinGraphics.fillCircle(12, 12, 12);
  coinGraphics.generateTexture('coin', 24, 24);
  coinGraphics.destroy();
}

function create() {
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

  // 创建金币组
  coins = this.physics.add.group();

  // 随机分布20个金币在空中
  const coinPositions = [
    { x: 600, y: 400 }, { x: 200, y: 400 }, { x: 400, y: 300 },
    { x: 100, y: 200 }, { x: 700, y: 200 }, { x: 400, y: 100 },
    { x: 150, y: 350 }, { x: 650, y: 350 }, { x: 300, y: 250 },
    { x: 500, y: 250 }, { x: 250, y: 150 }, { x: 550, y: 150 },
    { x: 350, y: 500 }, { x: 450, y: 420 }, { x: 750, y: 300 },
    { x: 50, y: 300 }, { x: 500, y: 80 }, { x: 300, y: 80 },
    { x: 150, y: 480 }, { x: 650, y: 480 }
  ];

  coinPositions.forEach(pos => {
    const coin = coins.create(pos.x, pos.y, 'coin');
    coin.setBounce(0.3);
    coin.setCollideWorldBounds(true);
  });

  // 添加碰撞检测
  this.physics.add.collider(player, platforms);
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
    player.setVelocityY(-500);
  }
}

function collectCoin(player, coin) {
  // 移除金币
  coin.disableBody(true, true);

  // 增加分数
  score += 10;
  scoreText.setText('Score: ' + score);

  // 检查是否收集完所有金币
  if (score === 200) {
    scoreText.setText('Score: ' + score + ' - YOU WIN!');
    scoreText.setStyle({ fill: '#ff0000' });
  }
}

// 启动游戏
const game = new Phaser.Game(config);