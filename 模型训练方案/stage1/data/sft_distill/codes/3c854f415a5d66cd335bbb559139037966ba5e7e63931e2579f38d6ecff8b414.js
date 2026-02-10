class PlatformGame extends Phaser.Scene {
  constructor() {
    super('PlatformGame');
    this.score = 0;
    this.collectedCoins = 0;
  }

  preload() {
    // 使用 Graphics 生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面纹理（深灰色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x444444, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 580, 'ground');

    // 创建空中平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(400, 300, 'platform');
    this.platforms.create(100, 250, 'platform');
    this.platforms.create(700, 200, 'platform');
    this.platforms.create(350, 150, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 添加玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在平台上方生成 10 个金币
    const coinPositions = [
      { x: 200, y: 400 },
      { x: 600, y: 350 },
      { x: 400, y: 250 },
      { x: 100, y: 200 },
      { x: 700, y: 150 },
      { x: 350, y: 100 },
      { x: 500, y: 350 },
      { x: 250, y: 200 },
      { x: 650, y: 250 },
      { x: 150, y: 400 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
    });

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 玩家收集金币
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    });

    // 创建提示文本
    this.infoText = this.add.text(16, 56, 'Coins: 0/10', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    });

    // 创建控制提示
    this.add.text(16, 90, 'Arrow Keys: Move | Up: Jump', {
      fontSize: '16px',
      fill: '#aaa',
      fontFamily: 'Arial'
    });
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.collectedCoins += 1;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);
    this.infoText.setText('Coins: ' + this.collectedCoins + '/10');

    // 检查是否收集完所有金币
    if (this.collectedCoins === 10) {
      this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 6
      }).setOrigin(0.5);

      // 暂停游戏
      this.physics.pause();
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

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: PlatformGame
};

// 启动游戏
const game = new Phaser.Game(config);