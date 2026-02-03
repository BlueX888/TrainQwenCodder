class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalCollectibles = 8;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建收集品纹理
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffdd00, 1);
    collectibleGraphics.fillRect(0, 0, 30, 30);
    collectibleGraphics.generateTexture('collectible', 30, 30);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集品物理组
    this.collectibles = this.physics.add.group();

    // 随机生成8个收集品
    for (let i = 0; i < this.totalCollectibles; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setImmovable(true);
    }

    // 添加碰撞检测
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
      stroke: '#000000',
      strokeThickness: 4
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

  collectItem(player, collectible) {
    // 销毁收集品
    collectible.destroy();

    // 增加计数
    this.collectedCount++;

    // 更新文本
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalCollectibles}`);

    // 检查是否收集完成
    if (this.collectedCount >= this.totalCollectibles) {
      this.winText.setVisible(true);
      this.player.setVelocity(0, 0);
      
      // 添加闪烁效果
      this.tweens.add({
        targets: this.winText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  update() {
    // 只有在未通关时才允许移动
    if (this.collectedCount < this.totalCollectibles) {
      const speed = 200;

      // 重置速度
      this.player.setVelocity(0);

      // 检测键盘输入
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
      }

      // 归一化对角线速度
      if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
        this.player.body.velocity.normalize().scale(speed);
      }
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