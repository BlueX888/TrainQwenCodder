const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
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
  // 创建玩家纹理 - 蓝色方块
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理 - 绿色矩形
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00aa00, 1);
  platformGraphics.fillRect(0, 0, 200, 32);
  platformGraphics.generateTexture('platform', 200, 32);
  platformGraphics.destroy();

  // 创建金币纹理 - 黄色圆形
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xffdd00, 1);
  coinGraphics.fillCircle(16, 16, 16);
  coinGraphics.generateTexture('coin', 32, 32);
  coinGraphics.destroy();
}

function create() {
  // 创建静态平台组
  platforms = this.physics.add.staticGroup();

  // 地面平台
  platforms.create(400, 568, 'platform').setScale(4, 1).refreshBody();
  
  // 中层平台
  platforms.create(600, 450, 'platform');
  platforms.create(200, 450, 'platform');
  platforms.create(400, 350, 'platform');
  
  // 上层平台
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
  coins = this.physics.add.group();

  // 在不同位置生成12个金币
  const coinPositions = [
    { x: 100, y: 200 },
    { x: 700, y: 200 },
    { x: 400, y: 100 },
    { x: 200, y: 400 },
    { x: 600, y: 400 },
    { x: 400, y: 300 },
    { x: 300, y: 150 },
    { x: 500, y: 150 },
    { x: 150, y: 450 },
    { x: 650, y: 450 },
    { x: 400, y: 500 },
    { x: 250, y: 300 }
  ];

  coinPositions.forEach(pos => {
    const coin = coins.create(pos.x, pos.y, 'coin');
    coin.setBounce(0.3);
  });

  // 金币与平台碰撞
  this.physics.add.collider(coins, platforms);

  // 玩家收集金币
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0 / 12', {
    fontSize: '32px',
    fill: '#ffffff',
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

  // 跳跃控制 - 只有在地面或平台上才能跳跃
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-500);
  }
}

function collectCoin(player, coin) {
  // 移除金币
  coin.disableBody(true, true);
  
  // 增加分数
  score += 1;
  
  // 更新分数显示
  scoreText.setText('Score: ' + score + ' / 12');
  
  // 检查是否收集完所有金币
  if (score === 12) {
    scoreText.setText('Score: 12 / 12 - YOU WIN!');
    scoreText.setStyle({ fill: '#00ff00' });
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);