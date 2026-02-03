class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 8;
    this.collectibles = null;
    this.player = null;
    this.levelText = null;
    this.scoreText = null;
    this.gameCompleteText = null;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
    this.createTextures();
  }

  create() {
    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建第一关的收集物
    this.createLevel();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（紫色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0x9933ff, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();
  }

  createLevel() {
    // 销毁之前的收集物组
    if (this.collectibles) {
      this.collectibles.clear(true, true);
    }

    // 创建新的收集物组
    this.collectibles = this.physics.add.group();

    // 每关收集物数量 = 2 + 关卡数
    const itemCount = 2 + this.level;

    // 使用固定种子的随机数生成器确保可重现性
    const seed = ['level', this.level];
    const rng = new Phaser.Math.RandomDataGenerator(seed);

    // 生成收集物位置
    for (let i = 0; i < itemCount; i++) {
      const x = rng.between(50, 750);
      const y = rng.between(100, 400);
      
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(12); // 设置圆形碰撞体
    }

    // 更新关卡文本
    this.levelText.setText(`Level: ${this.level}`);
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();

    // 增加分数（每个收集物10分）
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完当前关卡所有物品
    if (this.collectibles.countActive(true) === 0) {
      this.advanceLevel();
    }
  }

  advanceLevel() {
    // 进入下一关
    this.level++;

    if (this.level > this.maxLevel) {
      // 游戏完成
      this.showGameComplete();
    } else {
      // 创建下一关
      this.time.delayedCall(500, () => {
        this.createLevel();
      });
    }
  }

  showGameComplete() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 显示完成信息
    if (!this.gameCompleteText) {
      this.gameCompleteText = this.add.text(400, 300, 
        `GAME COMPLETE!\nFinal Score: ${this.score}`, 
        {
          fontSize: '48px',
          fill: '#9933ff',
          align: 'center'
        }
      );
      this.gameCompleteText.setOrigin(0.5);
    }
  }

  update(time, delta) {
    if (!this.player || this.physics.world.isPaused) {
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
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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

// 导出状态信号用于验证
if (typeof window !== 'undefined') {
  window.getGameState = () => ({
    level: game.scene.scenes[0].level,
    score: game.scene.scenes[0].score,
    maxLevel: game.scene.scenes[0].maxLevel,
    collectiblesRemaining: game.scene.scenes[0].collectibles ? 
      game.scene.scenes[0].collectibles.countActive(true) : 0
  });
}