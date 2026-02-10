class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 20;
    this.enemyIncrement = 2;
    this.totalEnemies = 0;
    this.remainingEnemies = 0;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化随机数生成器
    this.rng = this.createSeededRandom(this.seed);

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.collectEnemy,
      null,
      this
    );

    // 开始第一关
    this.startLevel();
  }

  createSeededRandom(seed) {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  startLevel() {
    // 计算当前关卡敌人数量
    this.totalEnemies = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    this.remainingEnemies = this.totalEnemies;

    // 更新UI
    this.updateUI();

    // 清空之前的敌人
    this.enemies.clear(true, true);

    // 生成敌人
    this.spawnEnemies();

    // 隐藏消息文本
    this.messageText.setVisible(false);
  }

  spawnEnemies() {
    const padding = 50;
    const minDistance = 100; // 敌人之间以及与玩家的最小距离

    for (let i = 0; i < this.totalEnemies; i++) {
      let x, y;
      let validPosition = false;
      let attempts = 0;
      const maxAttempts = 100;

      // 尝试找到一个有效位置
      while (!validPosition && attempts < maxAttempts) {
        x = padding + this.rng() * (800 - 2 * padding);
        y = padding + this.rng() * (400 - 2 * padding); // 上半部分区域

        validPosition = true;

        // 检查与玩家的距离
        const distToPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
        if (distToPlayer < minDistance) {
          validPosition = false;
          attempts++;
          continue;
        }

        // 检查与其他敌人的距离
        const existingEnemies = this.enemies.getChildren();
        for (let enemy of existingEnemies) {
          const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
          if (dist < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      // 如果找不到有效位置，使用随机位置
      if (!validPosition) {
        x = padding + this.rng() * (800 - 2 * padding);
        y = padding + this.rng() * (400 - 2 * padding);
      }

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (this.rng() - 0.5) * 100,
        (this.rng() - 0.5) * 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  collectEnemy(player, enemy) {
    enemy.destroy();
    this.remainingEnemies--;
    this.updateUI();

    // 检查是否清空所有敌人
    if (this.remainingEnemies === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.gameWin();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.messageText.setText(`Level ${this.currentLevel - 1} Complete!\nStarting Level ${this.currentLevel}...`);
      this.messageText.setVisible(true);

      // 2秒后开始下一关
      this.time.delayedCall(2000, () => {
        this.startLevel();
      });
    }
  }

  gameWin() {
    this.messageText.setText('Congratulations!\nYou completed all 5 levels!');
    this.messageText.setVisible(true);
    this.player.setVelocity(0, 0);
    this.physics.pause();
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}/${this.totalEnemies}`);
  }

  update() {
    if (this.physics.world.isPaused) {
      return;
    }

    // 玩家移动控制
    const speed = 300;
    this.player.setVelocity(0);

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

// 暴露状态用于验证
game.scene.scenes[0].events.on('create', () => {
  const scene = game.scene.scenes[0];
  window.gameState = {
    getCurrentLevel: () => scene.currentLevel,
    getRemainingEnemies: () => scene.remainingEnemies,
    getTotalEnemies: () => scene.totalEnemies,
    getMaxLevel: () => scene.maxLevel,
    isGameWon: () => scene.physics.world.isPaused && scene.currentLevel >= scene.maxLevel
  };
});