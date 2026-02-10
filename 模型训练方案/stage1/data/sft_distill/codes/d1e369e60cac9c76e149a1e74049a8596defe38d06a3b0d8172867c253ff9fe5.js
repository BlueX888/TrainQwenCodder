class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    this.score = 0;
  }

  preload() {
    // 使用Graphics创建纹理，不需要外部资源
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
    platformGraphics.fillStyle(0x8B4513, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xFFD700, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 568, 'platform').setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(600, 400, 'platform').setScale(1, 1).refreshBody();
    this.platforms.create(50, 350, 'platform').setScale(1, 1).refreshBody();
    this.platforms.create(750, 300, 'platform').setScale(1, 1).refreshBody();
    this.platforms.create(300, 250, 'platform').setScale(1, 1).refreshBody();
    this.platforms.create(500, 150, 'platform').setScale(1, 1).refreshBody();

    // 创建金币组（8个金币）
    this.coins = this.physics.add.group();
    
    const coinPositions = [
      { x: 600, y: 350 },
      { x: 50, y: 300 },
      { x: 750, y: 250 },
      { x: 300, y: 200 },
      { x: 500, y: 100 },
      { x: 150, y: 200 },
      { x: 650, y: 150 },
      { x: 400, y: 80 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.2);
      coin.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // 添加金币收集检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 游戏完成提示文本（初始隐藏）
    this.winText = this.add.text(400, 300, 'All Coins Collected!\nPress SPACE to restart', {
      fontSize: '32px',
      fill: '#ffff00',
      fontStyle: 'bold',
      align: 'center'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    this.gameCompleted = false;
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      this.winText.setVisible(true);
      this.gameCompleted = true;
      this.physics.pause();
    }
  }

  update() {
    if (this.gameCompleted) {
      // 按空格键重新开始
      if (this.cursors.space.isDown) {
        this.scene.restart();
        this.score = 0;
        this.gameCompleted = false;
      }
      return;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面上才能跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
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
  scene: PlatformerScene
};

const game = new Phaser.Game(config);