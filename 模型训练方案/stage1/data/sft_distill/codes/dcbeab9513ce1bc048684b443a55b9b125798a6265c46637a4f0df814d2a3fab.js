class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 20;
    this.enemyIncrement = 2;
    this.totalEnemiesKilled = 0;
    this.gameCompleted = false;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建 UI 文本
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

    this.infoText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.infoText.setOrigin(0.5);
    this.infoText.setVisible(false);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.completeGame();
      return;
    }

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    
    // 清空之前的敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定种子确保可重现）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 使用伪随机保证确定性
      const x = ((seed + i * 137) % 700) + 50;
      const y = ((seed + i * 211) % 350) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 97) % 200) - 100,
        ((seed + i * 173) % 200) - 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新 UI
    this.updateUI();

    // 显示关卡开始信息
    this.showLevelInfo(`Level ${this.currentLevel}`, 1500);
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)}`);
  }

  showLevelInfo(text, duration) {
    this.infoText.setText(text);
    this.infoText.setVisible(true);
    
    this.time.delayedCall(duration, () => {
      this.infoText.setVisible(false);
    });
  }

  hitEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.totalEnemiesKilled++;

    // 更新 UI
    this.updateUI();

    // 检查是否清空所有敌人
    if (this.enemies.countActive(true) === 0) {
      this.currentLevel++;
      
      if (this.currentLevel <= this.maxLevel) {
        // 进入下一关
        this.time.delayedCall(1000, () => {
          this.startLevel();
        });
      } else {
        // 游戏完成
        this.time.delayedCall(500, () => {
          this.completeGame();
        });
      }
    }
  }

  completeGame() {
    this.gameCompleted = true;
    this.enemies.clear(true, true);
    this.player.setVelocity(0, 0);
    
    this.showLevelInfo(`Victory! All ${this.maxLevel} Levels Complete!`, 999999);
    
    // 显示统计信息
    const statsText = this.add.text(400, 350, 
      `Total Enemies Defeated: ${this.totalEnemiesKilled}`, {
      fontSize: '24px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    });
    statsText.setOrigin(0.5);
  }

  update() {
    if (this.gameCompleted) {
      return;
    }

    // 玩家移动控制
    const speed = 300;
    
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

// 可验证的状态信号（通过控制台访问）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    maxLevel: scene.maxLevel,
    enemiesRemaining: scene.enemies ? scene.enemies.countActive(true) : 0,
    totalEnemiesKilled: scene.totalEnemiesKilled,
    gameCompleted: scene.gameCompleted,
    expectedEnemiesThisLevel: scene.baseEnemyCount + (scene.currentLevel - 1) * scene.enemyIncrement
  };
};