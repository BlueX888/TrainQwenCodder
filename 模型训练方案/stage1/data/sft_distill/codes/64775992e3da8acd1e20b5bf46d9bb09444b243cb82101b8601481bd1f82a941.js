class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 8;
    this.score = 0;
    this.player = null;
    this.oranges = null;
    this.cursors = null;
    this.levelText = null;
    this.scoreText = null;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建橙色物品纹理（橙色圆形）
    const orangeGraphics = this.add.graphics();
    orangeGraphics.fillStyle(0xff8800, 1);
    orangeGraphics.fillCircle(12, 12, 12);
    orangeGraphics.generateTexture('orange', 24, 24);
    orangeGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建橙色物品组
    this.oranges = this.physics.add.group();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.oranges, this.collectOrange, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.currentLevel}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 初始化第一关
    this.setupLevel(this.currentLevel);
  }

  setupLevel(level) {
    // 清除现有橙色物品
    this.oranges.clear(true, true);

    // 使用固定种子生成确定性随机位置
    const rng = this.createSeededRandom(this.seed + level);
    
    // 每关橙色物品数量 = 3 + level
    const orangeCount = 3 + level;

    for (let i = 0; i < orangeCount; i++) {
      const x = 50 + rng() * 700;
      const y = 50 + rng() * 400;
      
      const orange = this.oranges.create(x, y, 'orange');
      orange.setCollideWorldBounds(true);
      orange.setBounce(0.5);
      orange.setVelocity(
        (rng() - 0.5) * 100,
        (rng() - 0.5) * 100
      );
    }

    // 更新关卡显示
    this.levelText.setText(`Level: ${this.currentLevel}`);
  }

  collectOrange(player, orange) {
    // 收集橙色物品
    orange.destroy();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完所有橙色物品
    if (this.oranges.countActive(true) === 0) {
      this.advanceLevel();
    }
  }

  advanceLevel() {
    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      
      // 重置玩家位置
      this.player.setPosition(400, 500);
      this.player.setVelocity(0, 0);

      // 设置下一关
      this.time.delayedCall(500, () => {
        this.setupLevel(this.currentLevel);
      });
    } else {
      // 游戏完成
      this.showGameComplete();
    }
  }

  showGameComplete() {
    const completeText = this.add.text(400, 300, 'ALL LEVELS COMPLETE!', {
      fontSize: '32px',
      fill: '#ffff00',
      fontStyle: 'bold'
    });
    completeText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 350, `Final Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });
    finalScoreText.setOrigin(0.5);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();
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

  // 创建确定性随机数生成器
  createSeededRandom(seed) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
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