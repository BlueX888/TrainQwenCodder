class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 20;
    this.enemyIncrement = 2;
    this.totalEnemiesThisLevel = 0;
    this.remainingEnemies = 0;
    this.gameComplete = false;
  }

  preload() {
    // 使用 Graphics 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 使用 Graphics 生成敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建敌人组
    this.enemies = this.physics.add.group();

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

    this.instructionText = this.add.text(400, 300, '', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.collectEnemy,
      null,
      this
    );

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    // 清除所有现有敌人
    this.enemies.clear(true, true);

    // 计算本关敌人数量
    this.totalEnemiesThisLevel = this.baseEnemyCount + (level - 1) * this.enemyIncrement;
    this.remainingEnemies = this.totalEnemiesThisLevel;

    // 更新UI
    this.updateUI();

    // 生成敌人
    this.spawnEnemies(this.totalEnemiesThisLevel);

    // 显示关卡开始提示
    this.instructionText.setText(`Level ${level} Start!\nCollect all ${this.totalEnemiesThisLevel} enemies!`);
    this.time.delayedCall(2000, () => {
      this.instructionText.setText('Use Arrow Keys to Move');
    });
  }

  spawnEnemies(count) {
    // 使用固定种子生成确定性位置
    const seed = this.currentLevel * 1000;
    
    for (let i = 0; i < count; i++) {
      // 简单的伪随机生成（基于种子和索引）
      const x = ((seed + i * 137) % 700) + 50;
      const y = ((seed + i * 251) % 400) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.body.setSize(32, 32);
      
      // 给敌人添加简单的移动行为
      const velocityX = ((seed + i * 17) % 100) - 50;
      const velocityY = ((seed + i * 31) % 100) - 50;
      enemy.setVelocity(velocityX, velocityY);
      enemy.setBounce(1, 1);
    }
  }

  collectEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.remainingEnemies--;

    // 更新UI
    this.updateUI();

    // 检查是否完成本关
    if (this.remainingEnemies === 0) {
      this.completeLevel();
    }
  }

  completeLevel() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);

    if (this.currentLevel < this.maxLevel) {
      // 进入下一关
      this.instructionText.setText(`Level ${this.currentLevel} Complete!\nNext Level in 2 seconds...`);
      
      this.time.delayedCall(2000, () => {
        this.currentLevel++;
        this.startLevel(this.currentLevel);
      });
    } else {
      // 游戏完成
      this.gameComplete = true;
      this.instructionText.setText(`🎉 Game Complete! 🎉\nYou finished all ${this.maxLevel} levels!`);
      this.instructionText.setFontSize('28px');
      this.instructionText.setColor('#00ff00');
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(
      `Enemies: ${this.remainingEnemies}/${this.totalEnemiesThisLevel}`
    );
  }

  update() {
    if (this.gameComplete) {
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

    // 让敌人保持在边界内反弹
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.body) {
        // 确保敌人在碰到边界时反弹
        if (enemy.body.blocked.left || enemy.body.blocked.right) {
          enemy.body.velocity.x *= -1;
        }
        if (enemy.body.blocked.up || enemy.body.blocked.down) {
          enemy.body.velocity.y *= -1;
        }
      }
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

// 可验证的状态信号（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    maxLevel: scene.maxLevel,
    totalEnemiesThisLevel: scene.totalEnemiesThisLevel,
    remainingEnemies: scene.remainingEnemies,
    gameComplete: scene.gameComplete
  };
};