class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalCollectibles = 10;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建收集物纹理
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillRect(0, 0, 30, 30);
    collectibleGraphics.generateTexture('collectible', 30, 30);
    collectibleGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 随机生成10个收集物
    for (let i = 0; i < this.totalCollectibles; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setImmovable(true);
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

    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, '收集进度: 0/10', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 添加说明文本
    this.add.text(16, 560, '使用方向键移动收集黄色方块', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
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

    // 增加收集计数
    this.collectedCount++;

    // 更新 UI
    this.scoreText.setText(`收集进度: ${this.collectedCount}/${this.totalCollectibles}`);

    // 检查是否收集完成
    if (this.collectedCount >= this.totalCollectibles) {
      this.winText.setVisible(true);
      this.player.setVelocity(0, 0); // 停止玩家移动

      // 添加闪烁效果
      this.tweens.add({
        targets: this.winText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      // 禁用玩家控制
      this.cursors.left.isDown = false;
      this.cursors.right.isDown = false;
      this.cursors.up.isDown = false;
      this.cursors.down.isDown = false;
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

// 创建游戏实例
const game = new Phaser.Game(config);