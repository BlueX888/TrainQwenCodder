class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.coinsCollected = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      coinsCollected: 0,
      totalCoins: 3,
      playerX: 0,
      playerY: 0,
      gameComplete: false
    };

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    const ground = this.platforms.create(400, 568, 'platform');
    ground.setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(400, 300, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 2,
      setXY: { x: 200, y: 350, stepX: 200 }
    });

    // 设置金币属性
    this.coins.children.iterate((coin) => {
      coin.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
    });

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 玩家收集金币
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    });

    // 游戏提示
    this.add.text(400, 100, 'Collect 3 Coins!', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 控制提示
    this.add.text(400, 550, 'Arrow Keys: Move | UP: Jump', {
      fontSize: '16px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    console.log('[GAME_START]', JSON.stringify({
      timestamp: Date.now(),
      totalCoins: 3,
      gravity: 300
    }));
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    
    this.score += 10;
    this.coinsCollected += 1;
    
    this.scoreText.setText('Score: ' + this.score);

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.coinsCollected = this.coinsCollected;

    console.log('[COIN_COLLECTED]', JSON.stringify({
      timestamp: Date.now(),
      coinsCollected: this.coinsCollected,
      score: this.score,
      remainingCoins: 3 - this.coinsCollected
    }));

    // 检查是否收集完所有金币
    if (this.coinsCollected === 3) {
      window.__signals__.gameComplete = true;
      
      this.add.text(400, 200, 'YOU WIN!', {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 6
      }).setOrigin(0.5);

      console.log('[GAME_COMPLETE]', JSON.stringify({
        timestamp: Date.now(),
        finalScore: this.score,
        coinsCollected: this.coinsCollected
      }));
    }
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

    // 跳跃（只能在地面或平台上跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新玩家位置信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);