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

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    const ground = this.platforms.create(400, 584, 'platform');
    ground.setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(400, 250, 'platform');
    this.platforms.create(700, 350, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在不同位置创建5个金币
    const coinPositions = [
      { x: 600, y: 380 },
      { x: 50, y: 280 },
      { x: 400, y: 180 },
      { x: 700, y: 280 },
      { x: 300, y: 400 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.2);
      coin.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // 玩家收集金币
    this.physics.add.overlap(
      this.player, 
      this.coins, 
      this.collectCoin, 
      null, 
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 添加游戏说明
    this.add.text(16, 56, 'Arrow Keys: Move | Space/Up: Jump', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加获胜提示文本（初始隐藏）
    this.winText = this.add.text(400, 300, 'You Win! All coins collected!', {
      fontSize: '32px',
      fill: '#ffff00',
      fontStyle: 'bold'
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

    // 跳跃控制（必须在地面上才能跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.destroy();
    
    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      this.winText.setVisible(true);
      
      // 可选：2秒后重新生成金币
      this.time.delayedCall(2000, () => {
        this.winText.setVisible(false);
        this.respawnCoins();
      });
    }
  }

  respawnCoins() {
    const coinPositions = [
      { x: 600, y: 380 },
      { x: 50, y: 280 },
      { x: 400, y: 180 },
      { x: 700, y: 280 },
      { x: 300, y: 400 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.2);
      coin.setCollideWorldBounds(true);
    });
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 导出验证状态（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}