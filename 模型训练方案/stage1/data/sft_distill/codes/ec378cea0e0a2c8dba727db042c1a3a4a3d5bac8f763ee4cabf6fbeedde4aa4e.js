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
  },
  backgroundColor: '#87CEEB'
};

let player;
let platforms;
let coins;
let cursors;
let scoreText;
let score = 0;

function preload() {
  // 使用Graphics创建角色纹理
  const graphics = this.add.graphics();
  
  // 创建玩家纹理（蓝色方块）
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 32, 48);
  graphics.generateTexture('player', 32, 48);
  graphics.clear();
  
  // 创建金币纹理（黄色圆形）
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(12, 12, 12);
  graphics.lineStyle(2, 0xffa500, 1);
  graphics.strokeCircle(12, 12, 12);
  graphics.generateTexture('coin', 24, 24);
  graphics.clear();
  
  // 创建平台纹理（绿色矩形）
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 200, 20);
  graphics.generateTexture('platform', 200, 20);
  graphics.clear();
  
  // 创建地面纹理（深绿色）
  graphics.fillStyle(0x228b22, 1);
  graphics.fillRect(0, 0, 800, 32);
  graphics.generateTexture('ground', 800, 32);
  
  graphics.destroy();
}

function create() {
  // 创建平台组
  platforms = this.physics.add.staticGroup();
  
  // 添加地面
  platforms.create(400, 584, 'ground').setScale(1).refreshBody();
  
  // 添加空中平台
  platforms.create(150, 450, 'platform');
  platforms.create(400, 380, 'platform');
  platforms.create(650, 450, 'platform');
  platforms.create(250, 280, 'platform');
  platforms.create(550, 280, 'platform');
  platforms.create(100, 180, 'platform');
  platforms.create(700, 180, 'platform');
  platforms.create(400, 150, 'platform');
  
  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  
  // 玩家与平台碰撞
  this.physics.add.collider(player, platforms);
  
  // 创建金币组
  coins = this.physics.add.group();
  
  // 在平台上方创建15个金币
  const coinPositions = [
    { x: 150, y: 400 },
    { x: 180, y: 400 },
    { x: 400, y: 330 },
    { x: 430, y: 330 },
    { x: 650, y: 400 },
    { x: 680, y: 400 },
    { x: 250, y: 230 },
    { x: 280, y: 230 },
    { x: 550, y: 230 },
    { x: 580, y: 230 },
    { x: 100, y: 130 },
    { x: 700, y: 130 },
    { x: 400, y: 100 },
    { x: 430, y: 100 },
    { x: 370, y: 100 }
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
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#000',
    fontFamily: 'Arial',
    stroke: '#fff',
    strokeThickness: 4
  });
  
  // 添加游戏说明
  this.add.text(16, 56, 'Arrow Keys: Move & Jump', {
    fontSize: '16px',
    fill: '#000',
    fontFamily: 'Arial',
    backgroundColor: '#ffffff88',
    padding: { x: 5, y: 5 }
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
  if (score === 150) {
    const winText = this.add.text(400, 300, 'YOU WIN!', {
      fontSize: '64px',
      fill: '#ffd700',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6
    });
    winText.setOrigin(0.5);
    
    // 停止游戏
    this.physics.pause();
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);