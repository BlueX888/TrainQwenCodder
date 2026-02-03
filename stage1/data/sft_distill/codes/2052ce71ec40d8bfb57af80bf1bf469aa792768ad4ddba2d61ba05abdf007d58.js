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
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 568, 'platform').setScale(4, 1).refreshBody();
    
    // 空中平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 300, 'platform');
    this.platforms.create(300, 250, 'platform');
    this.platforms.create(500, 150, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在不同高度创建5个金币
    const coinPositions = [
      { x: 600, y: 320 },
      { x: 50, y: 270 },
      { x: 750, y: 220 },
      { x: 300, y: 170 },
      { x: 500, y: 70 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.5);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // 设置金币收集
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建提示文本
    this.add.text(16, 56, 'Arrow Keys: Move | Space/Up: Jump', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    // 游戏完成文本（初始隐藏）
    this.winText = this.add.text(400, 300, 'All Coins Collected!\nScore: 5', {
      fontSize: '48px',
      fill: '#00ff00',
      fontStyle: 'bold',
      align: 'center'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
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
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.score === 5) {
      this.winText.setVisible(true);
      // 可选：暂停游戏或重新开始
      // this.physics.pause();
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