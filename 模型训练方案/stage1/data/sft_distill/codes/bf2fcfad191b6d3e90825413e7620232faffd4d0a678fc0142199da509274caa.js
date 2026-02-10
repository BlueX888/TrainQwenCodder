class PlatformGame extends Phaser.Scene {
  constructor() {
    super('PlatformGame');
    this.score = 0;
    this.player = null;
    this.platforms = null;
    this.coins = null;
    this.cursors = null;
    this.scoreText = null;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x7f8c8d, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理（金色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xf1c40f, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });
    this.scoreText.setScrollFactor(0);

    // 创建平台组（静态物理组）
    this.platforms = this.physics.add.staticGroup();

    // 地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    
    // 空中平台
    this.platforms.create(150, 450, 'platform');
    this.platforms.create(650, 400, 'platform');
    this.platforms.create(400, 300, 'platform');
    this.platforms.create(200, 200, 'platform');
    this.platforms.create(600, 150, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在平台附近创建 8 个金币
    const coinPositions = [
      { x: 150, y: 380 },
      { x: 650, y: 330 },
      { x: 400, y: 230 },
      { x: 200, y: 130 },
      { x: 600, y: 80 },
      { x: 300, y: 500 },
      { x: 500, y: 450 },
      { x: 700, y: 350 }
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
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
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
      this.player.setVelocityY(-500);
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      // 胜利提示
      const winText = this.add.text(400, 300, 'You Win!', {
        fontSize: '64px',
        fill: '#f1c40f',
        fontFamily: 'Arial'
      });
      winText.setOrigin(0.5);
      
      // 可以选择重新生成金币或重启游戏
      this.time.delayedCall(2000, () => {
        this.scene.restart();
      });
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: PlatformGame
};

// 创建游戏实例
const game = new Phaser.Game(config);