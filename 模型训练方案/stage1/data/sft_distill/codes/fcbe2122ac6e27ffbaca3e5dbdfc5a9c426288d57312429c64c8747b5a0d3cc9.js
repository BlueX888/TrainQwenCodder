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

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.lineStyle(2, 0xffaa00, 1);
    coinGraphics.strokeCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8B4513, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
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
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    this.platforms.create(400, 580, 'ground');

    // 添加空中平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 380, 'platform');
    this.platforms.create(100, 300, 'platform');
    this.platforms.create(400, 250, 'platform');
    this.platforms.create(650, 320, 'platform');
    this.platforms.create(700, 200, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();

    // 金币位置配置（分布在各个平台上方）
    const coinPositions = [
      { x: 200, y: 400 },
      { x: 250, y: 380 },
      { x: 500, y: 330 },
      { x: 550, y: 310 },
      { x: 100, y: 250 },
      { x: 150, y: 230 },
      { x: 400, y: 200 },
      { x: 450, y: 180 },
      { x: 650, y: 270 },
      { x: 700, y: 150 },
      { x: 750, y: 130 },
      { x: 350, y: 350 }
    ];

    // 创建12个金币
    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.2);
      coin.setCollideWorldBounds(true);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 设置金币收集
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    });
    this.scoreText.setDepth(10);

    // 显示收集进度
    this.progressText = this.add.text(16, 56, 'Coins: 0/12', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    });
    this.progressText.setDepth(10);

    // 完成提示文本（初始隐藏）
    this.completeText = this.add.text(400, 300, 'ALL COINS COLLECTED!', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);
    this.completeText.setDepth(20);
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

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.coinsCollected += 1;

    // 更新文本
    this.scoreText.setText('Score: ' + this.score);
    this.progressText.setText('Coins: ' + this.coinsCollected + '/12');

    // 检查是否收集完所有金币
    if (this.coinsCollected === 12) {
      this.completeText.setVisible(true);
      
      // 添加闪烁效果
      this.tweens.add({
        targets: this.completeText,
        alpha: { from: 1, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
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