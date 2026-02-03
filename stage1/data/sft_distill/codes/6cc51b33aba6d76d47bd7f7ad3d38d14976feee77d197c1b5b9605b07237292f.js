class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 584, 'platform').setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 320, 'platform');
    this.platforms.create(300, 250, 'platform');
    this.platforms.create(550, 180, 'platform');
    this.platforms.create(150, 150, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在不同高度和位置创建20个金币
    const coinPositions = [
      { x: 100, y: 300 }, { x: 200, y: 200 }, { x: 350, y: 200 },
      { x: 450, y: 400 }, { x: 650, y: 400 }, { x: 100, y: 100 },
      { x: 250, y: 100 }, { x: 600, y: 270 }, { x: 750, y: 270 },
      { x: 400, y: 520 }, { x: 500, y: 520 }, { x: 700, y: 520 },
      { x: 50, y: 300 }, { x: 300, y: 200 }, { x: 550, y: 130 },
      { x: 650, y: 130 }, { x: 150, y: 100 }, { x: 750, y: 270 },
      { x: 200, y: 520 }, { x: 600, y: 520 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // 金币收集检测
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
    this.scoreText.setScrollFactor(0);

    // 游戏完成提示文本（初始隐藏）
    this.completeText = this.add.text(400, 300, 'All Coins Collected!\nScore: 20', {
      fontSize: '48px',
      fill: '#ffd700',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6,
      align: 'center'
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);
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
      this.player.setVelocityY(-500);
    }
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.score === 20) {
      this.completeText.setVisible(true);
      // 可以选择暂停游戏或继续
      // this.physics.pause();
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);