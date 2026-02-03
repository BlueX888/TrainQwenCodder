class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.baseEnemies = 12;
    this.enemiesPerLevelIncrease = 2;
    this.remainingEnemies = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成当前关卡的敌人
    this.spawnEnemies();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.collectEnemy, null, this);

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    // 更新UI
    this.updateUI();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加可验证的状态信号
    this.gameState = {
      level: this.currentLevel,
      enemiesRemaining: this.remainingEnemies,
      totalLevels: this.totalLevels,
      isComplete: false
    };
  }

  spawnEnemies() {
    // 清除现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemies + (this.currentLevel - 1) * this.enemiesPerLevelIncrease;
    this.remainingEnemies = enemyCount;

    // 使用固定种子生成敌人位置（保证确定性）
    const seed = this.currentLevel * 1000;
    let random = this.seededRandom(seed);

    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      const x = 50 + random() * 700;
      const y = 50 + random() * 300;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (random() - 0.5) * 100,
        (random() - 0.5) * 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  // 简单的种子随机数生成器（保证确定性）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  collectEnemy(player, enemy) {
    // 消除敌人
    enemy.destroy();
    this.remainingEnemies--;

    // 更新UI
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.remainingEnemies === 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.currentLevel++;

    if (this.currentLevel > this.totalLevels) {
      // 游戏胜利
      this.gameOver(true);
    } else {
      // 进入下一关
      this.time.delayedCall(500, () => {
        this.spawnEnemies();
        this.updateUI();
        this.updateGameState();
      });
    }
  }

  gameOver(victory) {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 显示游戏结束信息
    if (victory) {
      this.gameOverText.setText('恭喜通关！\n完成全部 5 关');
      this.gameState.isComplete = true;
    }
    this.gameOverText.setVisible(true);

    // 3秒后重新开始
    this.time.delayedCall(3000, () => {
      this.currentLevel = 1;
      this.scene.restart();
    });
  }

  updateUI() {
    const enemyCount = this.baseEnemies + (this.currentLevel - 1) * this.enemiesPerLevelIncrease;
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.totalLevels}`);
    this.enemyCountText.setText(`敌人数: ${this.remainingEnemies}/${enemyCount}`);
  }

  updateGameState() {
    this.gameState.level = this.currentLevel;
    this.gameState.enemiesRemaining = this.remainingEnemies;
  }

  update(time, delta) {
    if (this.physics.world.isPaused) {
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

    // 更新游戏状态
    this.updateGameState();
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