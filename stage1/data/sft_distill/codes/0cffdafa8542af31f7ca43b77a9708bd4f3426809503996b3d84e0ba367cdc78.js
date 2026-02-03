class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.coinsCollected = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
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
    
    // 中间平台
    this.platforms.create(200, 400, 'platform');
    this.platforms.create(600, 400, 'platform');
    
    // 上层平台
    this.platforms.create(400, 250, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在平台上方放置3个金币
    this.coins.create(200, 340, 'coin');
    this.coins.create(400, 190, 'coin');
    this.coins.create(600, 340, 'coin');

    // 设置金币属性
    this.coins.children.iterate((coin) => {
      coin.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
    });

    // 碰撞检测：玩家与平台
    this.physics.add.collider(this.player, this.platforms);
    
    // 碰撞检测：金币与平台
    this.physics.add.collider(this.coins, this.platforms);

    // 重叠检测：玩家收集金币
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 提示文本
    this.add.text(16, 56, 'Arrow Keys to Move, UP to Jump', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });

    // 游戏状态文本（用于验证）
    this.statusText = this.add.text(16, 80, 'Coins: 0/3', {
      fontSize: '20px',
      fill: '#ffdd00',
      fontFamily: 'Arial'
    });
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

    // 跳跃（只有在地面上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 检查是否收集完所有金币
    if (this.coinsCollected === 3 && !this.gameCompleted) {
      this.gameCompleted = true;
      this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 10;
    this.coinsCollected += 1;
    
    // 更新显示
    this.scoreText.setText('Score: ' + this.score);
    this.statusText.setText('Coins: ' + this.coinsCollected + '/3');
    
    // 播放收集反馈（改变玩家颜色）
    this.player.setTint(0xffdd00);
    this.time.delayedCall(100, () => {
      this.player.clearTint();
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
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);