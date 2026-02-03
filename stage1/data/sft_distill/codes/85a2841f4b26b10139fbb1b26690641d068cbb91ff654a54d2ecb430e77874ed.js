class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色矩形）
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

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    
    // 其他平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(300, 280, 'platform');
    this.platforms.create(550, 200, 'platform');
    this.platforms.create(200, 150, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 4,
      setXY: { x: 150, y: 0, stepX: 150 }
    });

    // 设置金币位置和物理属性
    const coinPositions = [
      { x: 100, y: 300 },
      { x: 300, y: 230 },
      { x: 550, y: 150 },
      { x: 650, y: 400 },
      { x: 200, y: 100 }
    ];

    this.coins.children.entries.forEach((coin, index) => {
      coin.setPosition(coinPositions[index].x, coinPositions[index].y);
      coin.setBounce(0.4);
      coin.setCollideWorldBounds(true);
      coin.setVelocity(Phaser.Math.Between(-50, 50), 20);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // 玩家收集金币
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 显示提示文本
    this.add.text(16, 56, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '18px',
      fill: '#cccccc'
    });
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

    // 跳跃（只有在地面上才能跳）
    if (this.spaceKey.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      this.add.text(400, 300, 'You Win!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);