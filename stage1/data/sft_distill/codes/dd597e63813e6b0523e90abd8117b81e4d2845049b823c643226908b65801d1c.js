const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#87CEEB'
};

// 全局信号对象
window.__signals__ = {
  score: 0,
  coinsCollected: 0,
  totalCoins: 5,
  gameComplete: false
};

let player;
let platforms;
let coins;
let cursors;
let scoreText;
let score = 0;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x666666, 1);
  platformGraphics.fillRect(0, 0, 400, 32);
  platformGraphics.generateTexture('platform', 400, 32);
  platformGraphics.destroy();

  // 创建金币纹理
  const coinGraphics = this.add.graphics();
  coinGraphics.fillStyle(0xFFD700, 1);
  coinGraphics.fillCircle(12, 12, 12);
  coinGraphics.generateTexture('coin', 24, 24);
  coinGraphics.destroy();

  // 创建平台组
  platforms = this.physics.add.staticGroup();
  
  // 地面平台
  platforms.create(400, 568, 'platform').setScale(2).refreshBody();
  
  // 中间平台
  platforms.create(200, 450, 'platform').setScale(0.6).refreshBody();
  platforms.create(600, 400, 'platform').setScale(0.6).refreshBody();
  platforms.create(400, 300, 'platform').setScale(0.6).refreshBody();
  platforms.create(100, 200, 'platform').setScale(0.5).refreshBody();
  platforms.create(700, 200, 'platform').setScale(0.5).refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // 玩家与平台碰撞
  this.physics.add.collider(player, platforms);

  // 创建金币组
  coins = this.physics.add.group();
  
  // 在不同高度创建5个金币
  const coinPositions = [
    { x: 200, y: 380 },
    { x: 600, y: 330 },
    { x: 400, y: 230 },
    { x: 100, y: 130 },
    { x: 700, y: 130 }
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

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#000',
    fontStyle: 'bold'
  });

  // 添加跳跃提示
  this.add.text(16, 560, 'Arrow Keys: Move | Up: Jump', {
    fontSize: '16px',
    fill: '#333'
  });

  console.log(JSON.stringify({
    event: 'game_started',
    totalCoins: 5,
    gravity: 800
  }));
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

  // 跳跃（只能在地面或平台上跳跃）
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-500);
  }
}

function collectCoin(player, coin) {
  // 销毁金币
  coin.disableBody(true, true);
  
  // 增加分数
  score += 10;
  scoreText.setText('Score: ' + score);

  // 更新信号
  window.__signals__.score = score;
  window.__signals__.coinsCollected += 1;

  console.log(JSON.stringify({
    event: 'coin_collected',
    score: score,
    coinsCollected: window.__signals__.coinsCollected,
    remaining: window.__signals__.totalCoins - window.__signals__.coinsCollected
  }));

  // 检查是否收集完所有金币
  if (window.__signals__.coinsCollected === window.__signals__.totalCoins) {
    window.__signals__.gameComplete = true;
    
    // 显示胜利消息
    const winText = this.add.text(400, 300, 'YOU WIN!', {
      fontSize: '64px',
      fill: '#FFD700',
      fontStyle: 'bold'
    });
    winText.setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_complete',
      finalScore: score,
      allCoinsCollected: true
    }));
  }
}

new Phaser.Game(config);