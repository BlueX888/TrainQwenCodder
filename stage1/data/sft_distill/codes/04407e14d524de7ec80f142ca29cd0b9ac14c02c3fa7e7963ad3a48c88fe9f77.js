class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.collectedCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（紫色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0x9900ff, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 生成20个随机位置的收集物
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(12); // 设置圆形碰撞体
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建收集进度文本
    this.progressText = this.add.text(16, 56, 'Collected: 0/20', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 暴露验证信号
    window.__signals__ = {
      score: this.score,
      collectedCount: this.collectedCount,
      totalCollectibles: 20,
      gameComplete: false
    };

    console.log(JSON.stringify({
      type: 'game_start',
      timestamp: Date.now(),
      totalCollectibles: 20
    }));
  }

  update(time, delta) {
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
    // 销毁收集物
    collectible.destroy();

    // 增加分数
    this.score += 10;
    this.collectedCount += 1;

    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    this.progressText.setText('Collected: ' + this.collectedCount + '/20');

    // 更新验证信号
    window.__signals__.score = this.score;
    window.__signals__.collectedCount = this.collectedCount;

    // 输出日志
    console.log(JSON.stringify({
      type: 'item_collected',
      timestamp: Date.now(),
      score: this.score,
      collectedCount: this.collectedCount,
      remaining: 20 - this.collectedCount
    }));

    // 检查是否收集完所有物品
    if (this.collectedCount >= 20) {
      window.__signals__.gameComplete = true;
      
      // 显示完成信息
      const completeText = this.add.text(400, 300, 'ALL COLLECTED!', {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial'
      });
      completeText.setOrigin(0.5);

      console.log(JSON.stringify({
        type: 'game_complete',
        timestamp: Date.now(),
        finalScore: this.score
      }));
    }
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);