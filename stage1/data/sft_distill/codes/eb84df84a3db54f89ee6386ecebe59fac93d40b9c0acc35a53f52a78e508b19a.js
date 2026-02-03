class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalCollectibles = 5;
    this.gameCompleted = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffdd00, 1);
    collectibleGraphics.fillCircle(16, 16, 16);
    collectibleGraphics.generateTexture('collectible', 32, 32);
    collectibleGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 随机生成5个收集物
    for (let i = 0; i < this.totalCollectibles; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(16);
      collectible.body.setSize(32, 32);
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

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalCollectibles}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 添加控制提示
    this.add.text(16, 560, '使用方向键移动', {
      fontSize: '18px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    if (this.gameCompleted) {
      // 游戏完成后停止玩家移动
      this.player.setVelocity(0);
      return;
    }

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
    // 移除收集物
    collectible.destroy();

    // 更新计数
    this.collectedCount++;
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalCollectibles}`);

    // 检查是否收集完成
    if (this.collectedCount >= this.totalCollectibles) {
      this.gameCompleted = true;
      this.winText.setVisible(true);

      // 添加闪烁效果
      this.tweens.add({
        targets: this.winText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
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
  scene: CollectionGame
};

// 启动游戏
new Phaser.Game(config);