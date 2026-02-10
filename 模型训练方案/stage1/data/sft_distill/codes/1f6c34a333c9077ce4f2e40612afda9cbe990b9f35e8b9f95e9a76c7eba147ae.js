const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
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
  // 使用Graphics创建纹理，不需要外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x666666, 1);
  platformGraphics.fillRect(0, 0, 400, 32);
  platformGraphics.generateTexture('platform', 400, 32);
  platformGraphics.destroy();

  // 创建金币纹理
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xffff00, 1);
  coinGraphics.fillCircle(12, 12, 12);
  coinGraphics.generateTexture('coin', 24, 24);
  coinGraphics.destroy();

  // 创建平台组
  platforms = this.physics.add.staticGroup();

  // 地面平台
  platforms.create(400, 568, 'platform').setScale(2, 1).refreshBody();
  
  // 中间平台
  platforms.create(600, 450, 'platform').setScale(0.8, 1).refreshBody();
  platforms.create(200, 400, 'platform').setScale(0.6, 1).refreshBody();
  platforms.create(400, 300, 'platform').setScale(0.7, 1).refreshBody();
  platforms.create(100, 250, 'platform').setScale(0.5, 1).refreshBody();
  platforms.create(700, 200, 'platform').setScale(0.6, 1).refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 创建金币组
  coins = this.physics.add.group();

  // 在不同位置创建15个金币
  const coinPositions = [
    { x: 150, y: 350 },
    { x: 250, y: 350 },
    { x: 200, y: 300 },
    { x: 450, y: 250 },
    { x: 350, y: 250 },
    { x: 500, y: 250 },
    { x: 150, y: 200 },
    { x: 650, y: 400 },
    { x: 600, y: 350 },
    { x: 750, y: 150 },
    { x: 700, y: 100 },
    { x: 100, y: 150 },
    { x: 400, y: 150 },
    { x: 300, y: 100 },
    { x: 550, y: 200 }
  ];

  coinPositions.forEach(pos => {
    const coin = coins.create(pos.x, pos.y, 'coin');
    coin.setBounce(0.2);
    coin.setCollideWorldBounds(true);
  });

  // 添加碰撞检测
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(coins, platforms);

  // 添加重叠检测（收集金币）
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
    player.setVelocityY(-350);
  }
}

function collectCoin(player, coin) {
  // 销毁金币
  coin.disableBody(true, true);
  
  // 增加分数
  score += 10;
  scoreText.setText('Score: ' + score);
  
  // 检查是否收集完所有金币
  if (score === 150) {
    scoreText.setText('Score: ' + score + ' - YOU WIN!');
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);