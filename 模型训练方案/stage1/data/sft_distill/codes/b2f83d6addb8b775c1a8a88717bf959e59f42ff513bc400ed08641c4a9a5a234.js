class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.collectibles = null;
    this.cursors = null;
    this.score = 0;
    this.level = 1;
    this.maxLevel = 20;
    this.scoreText = null;
    this.levelText = null;
    this.collectiblesCount = 0;
    this.seed = 12345; // 固定种子保证可复现
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化随机数生成器
    this.rnd = new Phaser.Math.RandomDataGenerator([this.seed]);

    // 创建玩家纹理（白色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建可收集物品纹理（白色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffffff, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建可收集物品组
    this.collectibles = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 生成第一关
    this.generateLevel();
  }

  generateLevel() {
    // 清空现有物品
    this.collectibles.clear(true, true);

    // 重置随机数生成器以确保每关的物品位置一致
    this.rnd = new Phaser.Math.RandomDataGenerator([this.seed + this.level]);

    // 每关物品数量 = 3 + (关卡-1) * 2，第1关3个，第20关41个
    this.collectiblesCount = 3 + (this.level - 1) * 2;

    // 生成物品
    for (let i = 0; i < this.collectiblesCount; i++) {
      const x = this.rnd.between(50, 750);
      const y = this.rnd.between(50, 550);
      
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.body.setSize(24, 24);
      collectible.setImmovable(true);
    }

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // 重置玩家位置
    this.player.setPosition(400, 300);
    this.player.setVelocity(0, 0);
  }

  collectItem(player, collectible) {
    // 收集物品
    collectible.destroy();
    this.collectiblesCount--;
    
    // 增加分数（每个物品10分）
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完所有物品
    if (this.collectiblesCount <= 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    // 进入下一关
    this.level++;

    // 检查是否完成所有关卡
    if (this.level > this.maxLevel) {
      this.showVictory();
      return;
    }

    // 关卡奖励（每关额外50分）
    this.score += 50;

    // 生成新关卡
    this.time.delayedCall(500, () => {
      this.generateLevel();
    });
  }

  showVictory() {
    // 显示胜利信息
    const victoryText = this.add.text(400, 300, 'YOU WIN!\nAll 20 Levels Complete!', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    victoryText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 400, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#ffffff',
      align: 'center'
    });
    finalScoreText.setOrigin(0.5);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.cursors = null;
  }

  update(time, delta) {
    if (!this.cursors) return;

    const speed = 200;

    // 玩家移动控制
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
  backgroundColor: '#000000',
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

// 导出状态用于验证（可选）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    level: scene.level,
    score: scene.score,
    collectiblesRemaining: scene.collectiblesCount,
    maxLevel: scene.maxLevel
  };
};