class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4a90e2, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面平台（静态物理组）
    this.platforms = this.physics.add.staticGroup();
    
    // 地面
    const ground = this.platforms.create(400, 580, 'platform');
    ground.setScale(4, 1).refreshBody();

    // 中间平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(200, 300, 'platform');
    this.platforms.create(400, 200, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 2,
      setXY: { x: 200, y: 0, stepX: 200 }
    });

    // 设置每个金币的属性
    this.coins.children.iterate((coin, index) => {
      coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.6));
      // 让金币分布在不同高度
      if (index === 0) coin.setPosition(200, 250);
      if (index === 1) coin.setPosition(400, 150);
      if (index === 2) coin.setPosition(600, 350);
    });

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 玩家收集金币
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
    this.add.text(400, 50, 'Use Arrow Keys to Move & Jump', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
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

    // 跳跃（只有在地面或平台上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
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
      // 显示胜利信息
      const winText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      // 停止玩家移动
      this.player.setVelocity(0, 0);
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
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);