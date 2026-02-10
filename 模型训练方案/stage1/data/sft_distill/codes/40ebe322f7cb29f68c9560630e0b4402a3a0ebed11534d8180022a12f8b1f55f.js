class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.coinsCollected = 0;
  }

  preload() {
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
    coinGraphics.lineStyle(2, 0xffaa00);
    coinGraphics.strokeCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();
  }

  create() {
    // 添加分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    this.scoreText.setScrollFactor(0);

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    
    // 中层平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 350, 'platform');
    
    // 高层平台
    this.platforms.create(400, 250, 'platform');
    this.platforms.create(150, 150, 'platform');
    this.platforms.create(650, 150, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在不同高度放置12个金币
    const coinPositions = [
      { x: 100, y: 500 },
      { x: 300, y: 500 },
      { x: 500, y: 500 },
      { x: 700, y: 500 },
      { x: 50, y: 300 },
      { x: 600, y: 400 },
      { x: 750, y: 300 },
      { x: 400, y: 200 },
      { x: 150, y: 100 },
      { x: 650, y: 100 },
      { x: 300, y: 150 },
      { x: 550, y: 150 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0);
      coin.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // 添加重叠检测（收集金币）
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加完成提示文本（初始隐藏）
    this.completeText = this.add.text(400, 300, 'All Coins Collected!', {
      fontSize: '48px',
      fill: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 10;
    this.coinsCollected += 1;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coinsCollected === 12) {
      this.completeText.setVisible(true);
      console.log('Game Complete! Final Score:', this.score);
    }
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面或平台上才能跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 可验证的状态信号
console.log('Game initialized. Collect 12 coins to win!');
console.log('Controls: Arrow keys to move, Up arrow to jump');