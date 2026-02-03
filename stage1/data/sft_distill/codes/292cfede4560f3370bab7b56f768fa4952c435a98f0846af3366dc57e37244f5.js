class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 20;
    this.collectibles = null;
    this.player = null;
    this.levelText = null;
    this.scoreText = null;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化收集物组
    this.collectibles = this.physics.add.group();

    // 生成当前关卡的收集物
    this.generateLevel();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 添加背景色
    this.cameras.main.setBackgroundColor(0x222222);
  }

  generateLevel() {
    // 清除现有收集物
    this.collectibles.clear(true, true);

    // 根据关卡生成收集物数量（每关3-5个，随关卡递增）
    const baseCount = 3;
    const bonusCount = Math.floor(this.level / 5);
    const itemCount = baseCount + bonusCount;

    // 使用固定种子生成伪随机位置
    const rng = this.seededRandom(this.seed + this.level);

    for (let i = 0; i < itemCount; i++) {
      const x = 50 + rng() * 700;
      const y = 50 + rng() * 500;
      
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(12);
      collectible.body.setAllowGravity(false);
      
      // 添加轻微浮动效果
      this.tweens.add({
        targets: collectible,
        y: collectible.y + 10,
        duration: 1000 + rng() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
  }

  collectItem(player, collectible) {
    // 收集物品
    collectible.destroy();
    
    // 增加分数（每关分数递增）
    this.score += 10 * this.level;
    this.scoreText.setText(`Score: ${this.score}`);

    // 播放收集效果（缩放动画）
    this.tweens.add({
      targets: player,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });

    // 检查是否收集完所有物品
    if (this.collectibles.countActive(true) === 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;

    if (this.level > this.maxLevel) {
      // 通关
      this.showVictory();
    } else {
      // 进入下一关
      this.showLevelTransition();
    }
  }

  showLevelTransition() {
    // 显示关卡过渡文本
    const transitionText = this.add.text(400, 300, `Level ${this.level}`, {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    transitionText.setOrigin(0.5);

    // 重置玩家位置
    this.player.setPosition(400, 300);
    this.player.setVelocity(0, 0);

    // 动画效果
    this.tweens.add({
      targets: transitionText,
      alpha: 0,
      scale: 2,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        transitionText.destroy();
        this.generateLevel();
      }
    });
  }

  showVictory() {
    // 显示胜利信息
    const victoryText = this.add.text(400, 250, 'Victory!', {
      fontSize: '64px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });
    victoryText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 350, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    finalScoreText.setOrigin(0.5);

    // 禁用玩家控制
    this.player.body.setVelocity(0, 0);
    this.player.body.enable = false;

    // 胜利动画
    this.tweens.add({
      targets: [victoryText, finalScoreText],
      scale: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(time, delta) {
    if (!this.player || !this.player.body.enable) return;

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

  // 伪随机数生成器（使用种子）
  seededRandom(seed) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
}

// Phaser游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证
game.getState = function() {
  const scene = game.scene.scenes[0];
  return {
    level: scene.level,
    score: scene.score,
    collectiblesRemaining: scene.collectibles ? scene.collectibles.countActive(true) : 0,
    playerPosition: scene.player ? { x: scene.player.x, y: scene.player.y } : null
  };
};