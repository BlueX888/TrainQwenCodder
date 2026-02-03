class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（白色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffffff, 1);
    collectibleGraphics.fillCircle(10, 10, 10);
    collectibleGraphics.generateTexture('collectible', 20, 20);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setVelocity(0, 0);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 随机生成20个收集物
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(10); // 设置圆形碰撞体
    }

    // 设置碰撞检测
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
    this.scoreText.setDepth(100);

    // 添加提示文本
    this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
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

    // 检查是否收集完所有物品
    if (this.collectibles.countActive(true) === 0 && this.score > 0) {
      this.showVictoryMessage();
    }
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();

    // 增加分数
    this.score += 10;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 添加收集特效（简单的闪烁文字）
    const bonusText = this.add.text(collectible.x, collectible.y, '+10', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 文字上浮并消失
    this.tweens.add({
      targets: bonusText,
      y: bonusText.y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        bonusText.destroy();
      }
    });
  }

  showVictoryMessage() {
    if (this.victoryShown) return;
    this.victoryShown = true;

    const victoryText = this.add.text(400, 300, 'All Collected!\nFinal Score: ' + this.score, {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 胜利文字闪烁效果
    this.tweens.add({
      targets: victoryText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
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

const game = new Phaser.Game(config);