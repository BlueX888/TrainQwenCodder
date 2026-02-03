class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalCoins = 15;
  }

  preload() {
    // 使用Graphics创建纹理，避免外部资源依赖
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理（绿色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x2ecc71, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面纹理（棕色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    this.platforms.create(400, 580, 'ground');

    // 添加多个空中平台
    this.platforms.create(150, 480, 'platform');
    this.platforms.create(400, 400, 'platform');
    this.platforms.create(650, 320, 'platform');
    this.platforms.create(200, 240, 'platform');
    this.platforms.create(500, 180, 'platform');
    this.platforms.create(700, 480, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在平台附近生成15个金币
    const coinPositions = [
      { x: 150, y: 440 }, { x: 180, y: 440 }, { x: 120, y: 440 },
      { x: 400, y: 360 }, { x: 430, y: 360 }, { x: 370, y: 360 },
      { x: 650, y: 280 }, { x: 680, y: 280 },
      { x: 200, y: 200 }, { x: 230, y: 200 }, { x: 170, y: 200 },
      { x: 500, y: 140 }, { x: 530, y: 140 },
      { x: 700, y: 440 }, { x: 730, y: 440 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 设置金币收集
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 15', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 添加游戏说明
    this.add.text(16, 50, 'Arrow Keys: Move | Up: Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 胜利文本（初始隐藏）
    this.winText = this.add.text(400, 300, 'YOU WIN!', {
      fontSize: '48px',
      fill: '#ffd700',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 1;
    this.scoreText.setText(`Score: ${this.score} / ${this.totalCoins}`);

    // 检查是否收集完所有金币
    if (this.score >= this.totalCoins) {
      this.winText.setVisible(true);
      this.physics.pause();
    }
  }

  update(time, delta) {
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
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);