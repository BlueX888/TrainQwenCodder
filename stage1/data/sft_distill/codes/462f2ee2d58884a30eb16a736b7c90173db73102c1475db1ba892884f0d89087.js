class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.player = null;
    this.platforms = null;
    this.coins = null;
    this.scoreText = null;
    this.cursors = null;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 地面平台
    const ground = this.platforms.create(400, 568, 'platform');
    ground.setScale(4, 1).refreshBody();

    // 中间平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 250, 'platform');
    this.platforms.create(750, 220, 'platform');
    this.platforms.create(400, 350, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在不同位置放置8个金币
    const coinPositions = [
      { x: 100, y: 150 },
      { x: 300, y: 200 },
      { x: 500, y: 280 },
      { x: 700, y: 150 },
      { x: 200, y: 100 },
      { x: 600, y: 320 },
      { x: 400, y: 250 },
      { x: 750, y: 100 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
      coin.setVelocity(Phaser.Math.Between(-50, 50), 20);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 添加金币收集检测
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 添加游戏说明
    this.add.text(16, 56, 'Arrow Keys: Move | Up: Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面上才能跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查是否收集完所有金币
    if (this.score >= 8) {
      this.scoreText.setText('Score: ' + this.score + ' - YOU WIN!');
    }
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 1;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    console.log('Coin collected! Score:', this.score);
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);