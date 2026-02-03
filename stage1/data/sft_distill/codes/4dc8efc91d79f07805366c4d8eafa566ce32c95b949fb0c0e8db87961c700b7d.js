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
  // 使用Graphics创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 使用Graphics创建金币纹理
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xffff00, 1);
  coinGraphics.fillCircle(16, 16, 16);
  coinGraphics.lineStyle(2, 0xffa500, 1);
  coinGraphics.strokeCircle(16, 16, 16);
  coinGraphics.generateTexture('coin', 32, 32);
  coinGraphics.destroy();

  // 使用Graphics创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x8b4513, 1);
  platformGraphics.fillRect(0, 0, 400, 32);
  platformGraphics.generateTexture('platform', 400, 32);
  platformGraphics.destroy();
}

function create() {
  // 创建平台组
  platforms = this.physics.add.staticGroup();

  // 添加地面
  const ground = platforms.create(400, 584, 'platform');
  ground.setScale(2, 1).refreshBody();

  // 添加几个跳跃平台
  platforms.create(200, 450, 'platform').setScale(0.5, 1).refreshBody();
  platforms.create(600, 400, 'platform').setScale(0.5, 1).refreshBody();
  platforms.create(400, 300, 'platform').setScale(0.5, 1).refreshBody();
  platforms.create(100, 250, 'platform').setScale(0.4, 1).refreshBody();
  platforms.create(700, 200, 'platform').setScale(0.4, 1).refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 玩家与平台碰撞
  this.physics.add.collider(player, platforms);

  // 创建金币组
  coins = this.physics.add.group();

  // 在空中不同位置生成5个金币
  const coinPositions = [
    { x: 200, y: 350 },
    { x: 600, y: 300 },
    { x: 400, y: 200 },
    { x: 100, y: 150 },
    { x: 700, y: 100 }
  ];

  coinPositions.forEach(pos => {
    const coin = coins.create(pos.x, pos.y, 'coin');
    coin.setBounce(0.3);
    coin.setCollideWorldBounds(true);
    // 让金币有轻微的上下浮动效果
    this.tweens.add({
      targets: coin,
      y: pos.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
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
    fill: '#fff',
    fontStyle: 'bold',
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
  if (coins.countActive(true) === 0) {
    // 显示胜利信息
    const winText = this.add.text(400, 300, 'You Win!', {
      fontSize: '64px',
      fill: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6
    });
    winText.setOrigin(0.5);

    // 停止玩家移动
    player.setVelocity(0, 0);
    cursors = null;
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);