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
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建静态平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    
    // 添加跳跃平台
    this.platforms.create(100, 450, 'platform');
    this.platforms.create(300, 380, 'platform');
    this.platforms.create(500, 320, 'platform');
    this.platforms.create(700, 380, 'platform');
    this.platforms.create(600, 250, 'platform');
    this.platforms.create(200, 200, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 添加玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在不同高度和位置创建15个金币
    const coinPositions = [
      { x: 100, y: 400 },
      { x: 300, y: 330 },
      { x: 500, y: 270 },
      { x: 700, y: 330 },
      { x: 600, y: 200 },
      { x: 200, y: 150 },
      { x: 400, y: 100 },
      { x: 150, y: 350 },
      { x: 450, y: 220 },
      { x: 650, y: 300 },
      { x: 250, y: 280 },
      { x: 550, y: 180 },
      { x: 350, y: 450 },
      { x: 750, y: 450 },
      { x: 500, y: 500 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.2);
    });

    // 添加金币与平台的碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 添加玩家与金币的重叠检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 15', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加游戏说明文本
    this.add.text(16, 56, 'Arrow Keys: Move & Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
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

    // 跳跃（只能在接触平台时跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查是否收集完所有金币
    if (this.score === 15 && this.coins.countActive(true) === 0) {
      this.showVictoryMessage();
    }
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 1;
    
    // 更新分数文本
    this.scoreText.setText('Score: ' + this.score + ' / 15');

    // 添加收集音效的视觉反馈（闪烁效果）
    this.cameras.main.flash(100, 255, 215, 0, false);
  }

  showVictoryMessage() {
    if (!this.victoryShown) {
      this.victoryShown = true;
      
      const victoryText = this.add.text(400, 300, 'YOU WIN!\nAll Coins Collected!', {
        fontSize: '48px',
        fill: '#ffd700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      });
      victoryText.setOrigin(0.5);
      
      // 添加闪烁效果
      this.tweens.add({
        targets: victoryText,
        alpha: 0.3,
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
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);