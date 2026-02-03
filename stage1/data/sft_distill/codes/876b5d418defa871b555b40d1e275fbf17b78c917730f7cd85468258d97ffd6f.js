class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.coinsCollected = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理（绿色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x00ff00, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面纹理（深绿色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x008800, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    this.platforms.create(400, 580, 'ground').setScale(1).refreshBody();

    // 添加多个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 380, 'platform');
    this.platforms.create(100, 300, 'platform');
    this.platforms.create(600, 280, 'platform');
    this.platforms.create(350, 200, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();

    // 生成 10 个金币，随机分布在空中
    const coinPositions = [
      { x: 200, y: 400 },
      { x: 500, y: 330 },
      { x: 100, y: 250 },
      { x: 600, y: 230 },
      { x: 350, y: 150 },
      { x: 450, y: 320 },
      { x: 700, y: 200 },
      { x: 250, y: 180 },
      { x: 550, y: 150 },
      { x: 400, y: 100 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 设置金币收集
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 显示收集进度
    this.progressText = this.add.text(16, 56, 'Coins: 0/10', {
      fontSize: '24px',
      fill: '#ffdd00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 胜利文本（初始隐藏）
    this.winText = this.add.text(400, 300, 'YOU WIN!', {
      fontSize: '64px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
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

    // 跳跃控制（只能在地面或平台上跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 也支持上箭头跳跃
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.player.body.touching.down) {
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
    this.progressText.setText('Coins: ' + this.coinsCollected + '/10');

    // 检查是否收集完所有金币
    if (this.coinsCollected === 10) {
      this.winText.setVisible(true);
      // 可以添加游戏结束逻辑
      this.physics.pause();
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

const game = new Phaser.Game(config);