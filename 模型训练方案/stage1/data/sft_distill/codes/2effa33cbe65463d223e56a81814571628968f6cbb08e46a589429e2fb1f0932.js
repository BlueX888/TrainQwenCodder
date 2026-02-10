class PlatformGame extends Phaser.Scene {
  constructor() {
    super('PlatformGame');
    this.score = 0;
    this.coinsCollected = 0;
    this.totalCoins = 12;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.lineStyle(3, 0xffaa00, 1);
    coinGraphics.strokeCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      coinsCollected: 0,
      totalCoins: this.totalCoins,
      gameComplete: false
    };

    // 创建平台组（静态物理组）
    this.platforms = this.physics.add.staticGroup();

    // 添加地面平台
    this.platforms.create(400, 568, 'platform').setScale(4, 1).refreshBody();

    // 添加中层平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 300, 'platform');
    this.platforms.create(300, 250, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组（动态物理组）
    this.coins = this.physics.add.group();

    // 在不同位置创建12个金币
    const coinPositions = [
      { x: 100, y: 200 },
      { x: 200, y: 150 },
      { x: 300, y: 100 },
      { x: 400, y: 150 },
      { x: 500, y: 200 },
      { x: 600, y: 250 },
      { x: 700, y: 150 },
      { x: 150, y: 300 },
      { x: 400, y: 400 },
      { x: 650, y: 350 },
      { x: 750, y: 200 },
      { x: 550, y: 100 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounceY(Phaser.Math.FloatBetween(0.3, 0.5));
    });

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 玩家收集金币的重叠检测
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建金币计数文本
    this.coinText = this.add.text(16, 56, `Coins: 0/${this.totalCoins}`, {
      fontSize: '24px',
      fill: '#ffdd00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 日志初始状态
    console.log(JSON.stringify({
      event: 'game_start',
      totalCoins: this.totalCoins,
      gravity: 300
    }));
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.coinsCollected += 1;

    // 更新文本
    this.scoreText.setText('Score: ' + this.score);
    this.coinText.setText(`Coins: ${this.coinsCollected}/${this.totalCoins}`);

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.coinsCollected = this.coinsCollected;

    // 日志收集事件
    console.log(JSON.stringify({
      event: 'coin_collected',
      score: this.score,
      coinsCollected: this.coinsCollected,
      remaining: this.totalCoins - this.coinsCollected
    }));

    // 检查是否收集完所有金币
    if (this.coinsCollected === this.totalCoins) {
      window.__signals__.gameComplete = true;
      
      // 显示胜利文本
      const winText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      });
      winText.setOrigin(0.5);

      console.log(JSON.stringify({
        event: 'game_complete',
        finalScore: this.score,
        totalCoins: this.totalCoins
      }));
    }
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只能在地面或平台上跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }
  }
}

// 游戏配置
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
  scene: PlatformGame
};

// 启动游戏
const game = new Phaser.Game(config);