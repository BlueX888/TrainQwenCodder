class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.collectedCount = 0;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0x00ff00, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.collectibles = this.physics.add.group();
    
    // 生成8个收集物（随机位置）
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(12); // 设置圆形碰撞体
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 初始化验证信号
    window.__signals__ = {
      score: 0,
      collectedCount: 0,
      totalCollectibles: 8,
      gameActive: true
    };

    console.log(JSON.stringify({
      event: 'game_start',
      totalCollectibles: 8,
      timestamp: Date.now()
    }));
  }

  update() {
    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  collectItem(player, collectible) {
    // 收集物消失
    collectible.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.collectedCount += 1;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 更新验证信号
    window.__signals__.score = this.score;
    window.__signals__.collectedCount = this.collectedCount;

    // 输出日志
    console.log(JSON.stringify({
      event: 'item_collected',
      score: this.score,
      collectedCount: this.collectedCount,
      remaining: 8 - this.collectedCount,
      timestamp: Date.now()
    }));

    // 检查是否收集完所有物品
    if (this.collectedCount === 8) {
      window.__signals__.gameActive = false;
      console.log(JSON.stringify({
        event: 'game_complete',
        finalScore: this.score,
        timestamp: Date.now()
      }));

      // 显示完成提示
      this.add.text(400, 300, 'All Collected!', {
        fontSize: '48px',
        fill: '#ffff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);