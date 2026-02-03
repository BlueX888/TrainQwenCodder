class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.totalScore = 0;
    this.collectibles = null;
    this.player = null;
    this.cursors = null;
    this.levelText = null;
    this.scoreText = null;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 使用Graphics生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4444ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建紫色收集物纹理（圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0x9933ff, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();
  }

  create() {
    // 初始化随机数生成器
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed + this.level]);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setVelocityX(0);
    this.player.setVelocityY(0);

    // 创建收集物组
    this.collectibles = this.physics.add.group();
    
    // 根据关卡生成收集物数量（每关 level * 3 个）
    const collectibleCount = this.level * 3;
    for (let i = 0; i < collectibleCount; i++) {
      const x = this.rng.between(50, 750);
      const y = this.rng.between(50, 400);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(12);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.totalScore}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    const hintText = this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
    hintText.setOrigin(0.5);
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();

    // 增加分数（每个物品10分）
    this.totalScore += 10;
    this.scoreText.setText(`Score: ${this.totalScore}`);

    // 检查是否收集完所有物品
    if (this.collectibles.countActive(true) === 0) {
      this.completeLevel();
    }
  }

  completeLevel() {
    if (this.level < 8) {
      // 进入下一关
      this.level++;
      this.scene.restart();
    } else {
      // 游戏胜利
      this.showVictory();
    }
  }

  showVictory() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 显示胜利文本
    const victoryText = this.add.text(400, 300, 'YOU WIN!', {
      fontSize: '64px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    victoryText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 380, `Final Score: ${this.totalScore}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    finalScoreText.setOrigin(0.5);

    // 添加重新开始提示
    const restartText = this.add.text(400, 450, 'Press SPACE to Restart', {
      fontSize: '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
    restartText.setOrigin(0.5);

    // 添加重新开始功能
    this.input.keyboard.once('keydown-SPACE', () => {
      this.level = 1;
      this.totalScore = 0;
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (!this.player || !this.cursors) return;

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

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    level: scene.level,
    score: scene.totalScore,
    collectiblesRemaining: scene.collectibles ? scene.collectibles.countActive(true) : 0,
    isGameWon: scene.level === 8 && scene.collectibles && scene.collectibles.countActive(true) === 0
  };
};