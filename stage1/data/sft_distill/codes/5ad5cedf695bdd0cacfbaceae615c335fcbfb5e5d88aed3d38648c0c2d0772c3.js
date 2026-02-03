// 完整的 Phaser3 收集物品游戏
class CollectGame extends Phaser.Scene {
  constructor() {
    super('CollectGame');
    this.score = 0;
    this.totalCollectibles = 20;
    this.collectedCount = 0;
  }

  preload() {
    // 不需要加载外部资源，使用 Graphics 生成纹理
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      collected: 0,
      total: this.totalCollectibles,
      gameComplete: false
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（紫色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0x9932cc, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物物理组
    this.collectibles = this.physics.add.group();

    // 随机生成20个收集物
    for (let i = 0; i < this.totalCollectibles; i++) {
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

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建提示文本
    this.add.text(400, 16, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0);

    // 创建收集进度文本
    this.progressText = this.add.text(16, 56, `Collected: 0/${this.totalCollectibles}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 3
    });

    console.log(JSON.stringify({
      event: 'game_start',
      totalCollectibles: this.totalCollectibles,
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
    // 销毁收集物
    collectible.destroy();

    // 增加分数（每个收集物10分）
    this.score += 10;
    this.collectedCount += 1;

    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    this.progressText.setText(`Collected: ${this.collectedCount}/${this.totalCollectibles}`);

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.collected = this.collectedCount;

    // 输出收集日志
    console.log(JSON.stringify({
      event: 'item_collected',
      score: this.score,
      collected: this.collectedCount,
      remaining: this.totalCollectibles - this.collectedCount,
      timestamp: Date.now()
    }));

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalCollectibles) {
      window.__signals__.gameComplete = true;
      
      // 显示完成提示
      this.add.text(400, 300, 'ALL COLLECTED!\nCongratulations!', {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      }).setOrigin(0.5);

      console.log(JSON.stringify({
        event: 'game_complete',
        finalScore: this.score,
        timestamp: Date.now()
      }));

      // 停止玩家移动
      this.player.setVelocity(0, 0);
      this.cursors = null;
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
  scene: CollectGame
};

// 启动游戏
const game = new Phaser.Game(config);