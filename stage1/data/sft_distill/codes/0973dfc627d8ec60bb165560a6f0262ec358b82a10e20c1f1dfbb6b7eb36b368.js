// 平台跳跃收集游戏
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.score = 0;
    this.coinsCollected = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理（金色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.lineStyle(2, 0xffaa00, 1);
    coinGraphics.strokeCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      coinsCollected: 0,
      totalCoins: 3,
      playerX: 0,
      playerY: 0,
      gameState: 'playing'
    };

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(0); // 使用世界重力

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(200, 450, 'platform').setScale(1.5, 1).refreshBody();
    this.platforms.create(600, 400, 'platform').setScale(1.5, 1).refreshBody();
    this.platforms.create(400, 300, 'platform').setScale(1.5, 1).refreshBody();

    // 创建金币组
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 2,
      setXY: { x: 200, y: 350, stepX: 200 }
    });

    // 设置金币物理属性
    this.coins.children.iterate((coin) => {
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
      coin.body.setGravityY(-200); // 金币受较小重力，悬浮效果
    });

    // 碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 提示文本
    this.hintText = this.add.text(400, 50, 'Collect 3 Coins! Arrow Keys to Move, Up to Jump', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
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
      coinPosition: { x: coin.x, y: coin.y }
    }));

    // 检查是否收集完所有金币
    if (this.coinsCollected === 3) {
      window.__signals__.gameState = 'completed';
      this.hintText.setText('You Win! All Coins Collected!');
      this.hintText.setStyle({ fill: '#00ff00', fontSize: '28px' });
      
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

    // 跳跃（只有在地面上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      
      console.log('[PLAYER_JUMP]', JSON.stringify({
        timestamp: Date.now(),
        position: { x: this.player.x, y: this.player.y }
      }));
    }

    // 更新玩家位置信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
  }
}

// 游戏配置
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
  scene: PlatformScene
};

// 启动游戏
const game = new Phaser.Game(config);

console.log('[GAME_INIT]', JSON.stringify({
  timestamp: Date.now(),
  config: {
    width: config.width,
    height: config.height,
    gravity: config.physics.arcade.gravity.y
  }
}));