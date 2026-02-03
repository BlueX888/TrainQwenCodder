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
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理（绿色长方形）
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00ff00, 1);
  platformGraphics.fillRect(0, 0, 200, 20);
  platformGraphics.generateTexture('platform', 200, 20);
  platformGraphics.destroy();

  // 创建金币纹理（黄色圆形）
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xffff00, 1);
  coinGraphics.fillCircle(16, 16, 16);
  coinGraphics.lineStyle(3, 0xffa500, 1);
  coinGraphics.strokeCircle(16, 16, 16);
  coinGraphics.generateTexture('coin', 32, 32);
  coinGraphics.destroy();
}

function create() {
  // 创建静态平台组
  platforms = this.physics.add.staticGroup();

  // 地面平台
  platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();

  // 空中平台
  platforms.create(150, 450, 'platform');
  platforms.create(450, 380, 'platform');
  platforms.create(650, 300, 'platform');
  platforms.create(250, 250, 'platform');
  platforms.create(550, 180, 'platform');

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 创建金币组（12个）
  coins = this.physics.add.group();

  // 在不同位置创建12个金币
  const coinPositions = [
    { x: 150, y: 400 },
    { x: 200, y: 350 },
    { x: 450, y: 330 },
    { x: 500, y: 280 },
    { x: 650, y: 250 },
    { x: 700, y: 200 },
    { x: 250, y: 200 },
    { x: 300, y: 150 },
    { x: 550, y: 130 },
    { x: 600, y: 80 },
    { x: 400, y: 100 },
    { x: 350, y: 50 }
  ];

  coinPositions.forEach(pos => {
    const coin = coins.create(pos.x, pos.y, 'coin');
    coin.setBounce(0.2);
    coin.setCollideWorldBounds(true);
  });

  // 设置碰撞
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(coins, platforms);

  // 设置金币收集
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0 / 12', {
    fontSize: '24px',
    fill: '#000',
    fontStyle: 'bold',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  scoreText.setScrollFactor(0);
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

  // 跳跃控制（只能在地面或平台上跳跃）
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }

  // 检查是否收集完所有金币
  if (score >= 12) {
    scoreText.setText('Score: 12 / 12 - YOU WIN!');
    scoreText.setStyle({ fill: '#00ff00' });
  }
}

function collectCoin(player, coin) {
  // 移除金币
  coin.disableBody(true, true);

  // 增加分数
  score += 1;

  // 更新分数显示
  scoreText.setText('Score: ' + score + ' / 12');

  // 如果收集完所有金币，显示胜利信息
  if (score === 12) {
    const winText = this.add.text(400, 300, 'CONGRATULATIONS!\nAll coins collected!', {
      fontSize: '32px',
      fill: '#ffff00',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    });
    winText.setOrigin(0.5);
  }
}

// 启动游戏
const game = new Phaser.Game(config);