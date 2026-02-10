class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.coinsCollected = 0;
  }

  preload() {
    // 创建角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x654321, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建平台组（静态）
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    this.platforms.create(400, 580, 'ground').setScale(1).refreshBody();

    // 添加空中平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 380, 'platform');
    this.platforms.create(100, 320, 'platform');
    this.platforms.create(600, 300, 'platform');
    this.platforms.create(350, 250, 'platform');
    this.platforms.create(700, 200, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在平台上方生成10个金币
    const coinPositions = [
      { x: 200, y: 400 },
      { x: 500, y: 330 },
      { x: 100, y: 270 },
      { x: 600, y: 250 },
      { x: 350, y: 200 },
      { x: 700, y: 150 },
      { x: 400, y: 500 },
      { x: 300, y: 380 },
      { x: 550, y: 280 },
      { x: 150, y: 220 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.5);
      coin.setCollideWorldBounds(true);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 添加游戏提示
    this.add.text(400, 50, 'Collect all 10 coins!', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 添加控制提示
    this.add.text(400, 580, 'Arrow Keys to Move, UP to Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  update() {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面或平台上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查是否收集完所有金币
    if (this.coinsCollected === 10 && !this.gameCompleted) {
      this.gameCompleted = true;
      this.add.text(400, 300, 'YOU WIN!\nAll Coins Collected!', {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      }).setOrigin(0.5);
    }
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.coinsCollected += 1;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    console.log('Coin collected! Total:', this.coinsCollected, 'Score:', this.score);
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

const game = new Phaser.Game(config);