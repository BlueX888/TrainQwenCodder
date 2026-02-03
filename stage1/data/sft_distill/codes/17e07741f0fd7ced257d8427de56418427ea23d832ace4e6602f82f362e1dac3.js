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
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 400, 32);
    platformGraphics.generateTexture('platform', 400, 32);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
    
    // 中间平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 250, 'platform').setScale(0.5).refreshBody();
    this.platforms.create(750, 220, 'platform').setScale(0.5).refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 4, // 创建5个金币（0-4）
      setXY: { x: 150, y: 0, stepX: 150 }
    });

    // 设置金币属性
    this.coins.children.iterate((coin, index) => {
      coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      // 让金币分布在不同高度
      const yPositions = [100, 150, 120, 180, 130];
      coin.setY(yPositions[index]);
    });

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 玩家收集金币
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(400, 550, 'Use Arrow Keys to Move & Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
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
        fill: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      // 2秒后重新生成金币
      this.time.delayedCall(2000, () => {
        winText.destroy();
        this.coins.children.iterate((coin) => {
          coin.enableBody(true, coin.x, 0, true, true);
        });
      });
    }
  }

  update(time, delta) {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只能在地面或平台上跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }
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