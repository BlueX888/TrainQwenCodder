const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
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

  // 创建地面纹理（深绿色）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x008800, 1);
  groundGraphics.fillRect(0, 0, 800, 32);
  groundGraphics.generateTexture('ground', 800, 32);
  groundGraphics.destroy();

  // 创建金币纹理（黄色圆形）
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xffff00, 1);
  coinGraphics.fillCircle(16, 16, 16);
  coinGraphics.generateTexture('coin', 32, 32);
  coinGraphics.destroy();
}

function create() {
  // 创建平台组
  platforms = this.physics.add.staticGroup();

  // 添加地面
  platforms.create(400, 584, 'ground');

  // 添加跳跃平台
  platforms.create(100, 450, 'platform');
  platforms.create(300, 350, 'platform');
  platforms.create(500, 280, 'platform');
  platforms.create(700, 400, 'platform');
  platforms.create(600, 200, 'platform');

  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 玩家与平台碰撞
  this.physics.add.collider(player, platforms);

  // 创建金币组
  coins = this.physics.add.group();

  // 在平台上方创建10个金币
  const coinPositions = [
    { x: 100, y: 400 },
    { x: 300, y: 300 },
    { x: 500, y: 230 },
    { x: 700, y: 350 },
    { x: 600, y: 150 },
    { x: 200, y: 250 },
    { x: 400, y: 180 },
    { x: 650, y: 450 },
    { x: 150, y: 350 },
    { x: 550, y: 320 }
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

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#fff',
    fontFamily: 'Arial',
    stroke: '#000',
    strokeThickness: 4
  });
  scoreText.setDepth(100);

  // 添加游戏说明
  this.add.text(16, 56, 'Arrow Keys: Move & Jump', {
    fontSize: '16px',
    fill: '#fff',
    fontFamily: 'Arial',
    stroke: '#000',
    strokeThickness: 2
  });
}

function update() {
  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃（只能在地面或平台上跳跃）
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }

  // 检查是否收集完所有金币
  if (score === 10 && coins.countActive(true) === 0) {
    scoreText.setText('Score: ' + score + ' - YOU WIN!');
  }
}

function collectCoin(player, coin) {
  // 移除金币
  coin.disableBody(true, true);

  // 增加分数
  score += 1;
  scoreText.setText('Score: ' + score);

  // 播放简单的视觉反馈
  const flash = this.add.graphics();
  flash.fillStyle(0xffff00, 0.5);
  flash.fillCircle(coin.x, coin.y, 32);
  this.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 300,
    onComplete: () => flash.destroy()
  });
}

// 启动游戏
const game = new Phaser.Game(config);