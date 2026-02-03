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
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
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

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      coinsCollected: 0,
      playerX: 0,
      playerY: 0,
      gameComplete: false
    };

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 568, 'platform').setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(600, 400, 'platform').setScale(1, 1).refreshBody();
    this.platforms.create(50, 350, 'platform').setScale(1, 1).refreshBody();
    this.platforms.create(750, 300, 'platform').setScale(1, 1).refreshBody();

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在平台上方放置3个金币
    this.coins.create(600, 350, 'coin');
    this.coins.create(50, 300, 'coin');
    this.coins.create(750, 250, 'coin');

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 设置金币收集检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建提示文本
    this.hintText = this.add.text(400, 50, 'Use Arrow Keys to Move, Space/Up to Jump', {
      fontSize: '20px',
      fill: '#ffff00',
      fontStyle: 'bold'
    });
    this.hintText.setOrigin(0.5);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      totalCoins: 3
    }));
  }

  update() {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面上才能跳）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      console.log(JSON.stringify({
        event: 'player_jump',
        timestamp: Date.now(),
        position: { x: this.player.x, y: this.player.y }
      }));
    }

    // 更新信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.score = this.score;
    window.__signals__.coinsCollected = this.coinsCollected;
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 10;
    this.coinsCollected += 1;
    
    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    console.log(JSON.stringify({
      event: 'coin_collected',
      timestamp: Date.now(),
      coinsCollected: this.coinsCollected,
      totalCoins: 3,
      score: this.score,
      position: { x: coin.x, y: coin.y }
    }));

    // 检查是否收集完所有金币
    if (this.coinsCollected === 3) {
      window.__signals__.gameComplete = true;
      
      const congratsText = this.add.text(400, 300, 'All Coins Collected!\nScore: ' + this.score, {
        fontSize: '48px',
        fill: '#00ff00',
        fontStyle: 'bold',
        align: 'center'
      });
      congratsText.setOrigin(0.5);

      console.log(JSON.stringify({
        event: 'game_complete',
        timestamp: Date.now(),
        finalScore: this.score,
        coinsCollected: this.coinsCollected
      }));
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);