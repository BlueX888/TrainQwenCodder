class CollectGameScene extends Phaser.Scene {
  constructor() {
    super('CollectGameScene');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalCollectibles = 5;
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
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家精灵（启用物理）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 随机生成5个收集物
    for (let i = 0; i < this.totalCollectibles; i++) {
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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalCollectibles}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建通关文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    // 添加边界提示
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ffff, 1);
    graphics.strokeRect(0, 0, 800, 600);
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();

    // 增加收集计数
    this.collectedCount++;

    // 更新分数文本
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalCollectibles}`);

    // 检查是否完成游戏
    if (this.collectedCount >= this.totalCollectibles) {
      this.completeGame();
    }
  }

  completeGame() {
    this.gameCompleted = true;
    this.victoryText.setVisible(true);
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.victoryText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log('游戏完成！收集数:', this.collectedCount);
  }

  update(time, delta) {
    // 如果游戏已完成，不处理移动
    if (this.gameCompleted) {
      return;
    }

    // 重置速度
    this.player.setVelocity(0);

    const speed = 200;

    // 键盘控制
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
  scene: CollectGameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);