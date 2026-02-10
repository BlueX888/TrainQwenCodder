class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 20;
    this.totalScore = 0;
    this.collectedCount = 0;
    this.totalCollectibles = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const collectibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();
  }

  create() {
    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.currentLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.totalScore}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.progressText = this.add.text(16, 80, '', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化关卡
    this.setupLevel();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );
  }

  setupLevel() {
    // 清空现有收集物
    this.collectibles.clear(true, true);
    this.collectedCount = 0;

    // 计算当前关卡的收集物数量（每关 = level * 3）
    this.totalCollectibles = this.currentLevel * 3;

    // 使用固定种子生成收集物位置（基于关卡数）
    const seed = this.currentLevel * 1000;
    let rng = this.seededRandom(seed);

    for (let i = 0; i < this.totalCollectibles; i++) {
      // 生成随机位置（避免边缘）
      const x = 100 + rng() * 600;
      const y = 150 + rng() * 400;

      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(12);
      collectible.body.setAllowGravity(false);
      collectible.body.immovable = true;
    }

    // 重置玩家位置
    this.player.setPosition(400, 300);
    this.player.setVelocity(0, 0);

    // 更新UI
    this.updateUI();
  }

  seededRandom(seed) {
    // 简单的伪随机数生成器
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();

    // 增加计数和分数
    this.collectedCount++;
    this.totalScore += 10;

    // 更新UI
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.collectedCount >= this.totalCollectibles) {
      this.completeLevel();
    }
  }

  completeLevel() {
    // 关卡完成，额外奖励
    const levelBonus = this.currentLevel * 50;
    this.totalScore += levelBonus;

    // 检查是否完成所有关卡
    if (this.currentLevel >= this.maxLevel) {
      this.showVictory();
      return;
    }

    // 进入下一关
    this.currentLevel++;
    
    // 延迟一点时间再开始下一关
    this.time.delayedCall(500, () => {
      this.setupLevel();
    });
  }

  showVictory() {
    // 显示胜利信息
    const victoryText = this.add.text(400, 300, 'ALL LEVELS COMPLETE!', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
    victoryText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 360, `Final Score: ${this.totalScore}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    finalScoreText.setOrigin(0.5);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.scoreText.setText(`Score: ${this.totalScore}`);
    this.progressText.setText(`Collected: ${this.collectedCount}/${this.totalCollectibles}`);
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
    level: scene.currentLevel,
    score: scene.totalScore,
    collected: scene.collectedCount,
    total: scene.totalCollectibles,
    maxLevel: scene.maxLevel
  };
};