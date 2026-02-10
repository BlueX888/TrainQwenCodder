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
  platformGraphics.fillStyle(0x666666, 1);
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

  // 空中平台
  platforms.create(150, 450, 'platform');
  platforms.create(650, 400, 'platform');
  platforms.create(400, 300, 'platform');
  platforms.create(200, 200, 'platform');
  platforms.create(600, 150, 'platform');

  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // 添加玩家与平台的碰撞
  this.physics.add.collider(player, platforms);

  // 创建金币组
  coins = this.physics.add.group({
    key: 'coin',
    repeat: 4, // 总共5个金币
    setXY: { x: 150, y: 400, stepX: 130 }
  });

  // 调整金币位置使其更有挑战性
  coins.children.entries[0].setPosition(150, 400);
  coins.children.entries[1].setPosition(650, 350);
  coins.children.entries[2].setPosition(400, 250);
  coins.children.entries[3].setPosition(200, 150);
  coins.children.entries[4].setPosition(600, 100);

  // 设置金币的弹跳效果
  coins.children.iterate(function(coin) {
    coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.6));
  });

  // 添加金币与平台的碰撞
  this.physics.add.collider(coins, platforms);

  // 添加玩家与金币的重叠检测
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 显示分数
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 添加空格键作为跳跃的备选键
  this.input.keyboard.on('keydown-SPACE', function() {
    if (player.body.touching.down) {
      player.setVelocityY(-400);
    }
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
    // 游戏胜利提示
    const winText = this.add.text(400, 300, 'You Win!', {
      fontSize: '64px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });
    winText.setOrigin(0.5);

    // 停止玩家移动
    player.setVelocity(0, 0);
    cursors = null;
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);