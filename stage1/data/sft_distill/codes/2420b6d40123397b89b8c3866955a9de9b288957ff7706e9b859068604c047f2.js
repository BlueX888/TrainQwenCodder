class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalCollectibles = 12;
    this.gameCompleted = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillRect(0, 0, 24, 24);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);
    this.player.setMaxVelocity(300);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 随机生成12个收集物
    for (let i = 0; i < this.totalCollectibles; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setImmovable(true);
      
      // 添加闪烁效果
      this.tweens.add({
        targets: collectible,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
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

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.totalCollectibles}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建通关文字（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 创建提示文字
    this.add.text(400, 580, '使用方向键移动', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
  }

  update() {
    if (this.gameCompleted) {
      // 游戏完成后停止移动
      this.player.setVelocity(0);
      return;
    }

    // 玩家移动控制
    const speed = 300;

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
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();

    // 增加计数
    this.collectedCount++;

    // 更新UI
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalCollectibles}`);

    // 播放收集音效（使用视觉反馈代替）
    this.tweens.add({
      targets: this.player,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });

    // 检查是否收集完成
    if (this.collectedCount >= this.totalCollectibles) {
      this.gameCompleted = true;
      this.showWinScreen();
    }
  }

  showWinScreen() {
    // 显示通关文字
    this.winText.setVisible(true);

    // 添加闪烁动画
    this.tweens.add({
      targets: this.winText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 添加彩色背景效果
    const winBg = this.add.graphics();
    winBg.fillStyle(0x000000, 0.7);
    winBg.fillRect(0, 0, 800, 600);
    winBg.setDepth(-1);

    // 将通关文字置于最上层
    this.winText.setDepth(10);

    // 添加重新开始提示
    const restartText = this.add.text(400, 380, '刷新页面重新开始', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(10);
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
const game = new Phaser.Game(config);