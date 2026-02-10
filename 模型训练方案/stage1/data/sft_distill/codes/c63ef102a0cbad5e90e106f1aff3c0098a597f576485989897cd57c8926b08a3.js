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

// 全局信号对象
window.__signals__ = {
  currentLevel: 1,
  enemiesRemaining: 15,
  totalEnemies: 15,
  gameCompleted: false,
  logs: []
};

function logSignal(message, data) {
  const log = {
    timestamp: Date.now(),
    message,
    ...data
  };
  window.__signals__.logs.push(log);
  console.log(JSON.stringify(log));
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 15;
    this.enemyIncrement = 2;
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.levelText = null;
    this.enemyCountText = null;
    this.messageText = null;
    this.playerSpeed = 200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成当前关卡的敌人
    this.spawnEnemies();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.destroyEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI
    this.createUI();

    // 初始化信号
    this.updateSignals();

    logSignal('Level Started', {
      level: this.currentLevel,
      enemyCount: this.getEnemyCount(this.currentLevel)
    });
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemyTex', 32, 32);
    enemyGraphics.destroy();
  }

  getEnemyCount(level) {
    return this.baseEnemyCount + (level - 1) * this.enemyIncrement;
  }

  spawnEnemies() {
    const enemyCount = this.getEnemyCount(this.currentLevel);
    
    // 使用固定随机种子生成敌人位置（基于关卡）
    const seed = this.currentLevel * 1000;
    let randomState = seed;
    
    const seededRandom = () => {
      randomState = (randomState * 9301 + 49297) % 233280;
      return randomState / 233280;
    };

    for (let i = 0; i < enemyCount; i++) {
      // 确保敌人不会生成在玩家附近
      let x, y;
      do {
        x = 50 + seededRandom() * 700;
        y = 50 + seededRandom() * 500;
      } while (Phaser.Math.Distance.Between(x, y, 400, 300) < 100);

      const enemy = this.enemies.create(x, y, 'enemyTex');
      enemy.setVelocity(
        (seededRandom() - 0.5) * 100,
        (seededRandom() - 0.5) * 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  destroyEnemy(player, enemy) {
    enemy.destroy();
    
    const remaining = this.enemies.countActive(true);
    
    logSignal('Enemy Destroyed', {
      level: this.currentLevel,
      enemiesRemaining: remaining
    });

    this.updateSignals();

    if (remaining === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    logSignal('Level Complete', {
      level: this.currentLevel
    });

    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      this.showMessage(`关卡 ${this.currentLevel - 1} 完成！\n准备进入关卡 ${this.currentLevel}...`, () => {
        this.restartLevel();
      });
    } else {
      this.gameComplete();
    }
  }

  gameComplete() {
    window.__signals__.gameCompleted = true;
    
    logSignal('Game Complete', {
      totalLevels: this.maxLevel
    });

    this.showMessage('恭喜！你完成了所有 5 关！', () => {
      this.scene.restart();
      this.currentLevel = 1;
      window.__signals__.gameCompleted = false;
      window.__signals__.currentLevel = 1;
    });
  }

  restartLevel() {
    // 清除所有敌人
    this.enemies.clear(true, true);

    // 重置玩家位置
    this.player.setPosition(400, 300);
    this.player.setVelocity(0, 0);

    // 生成新关卡的敌人
    this.spawnEnemies();

    // 更新UI和信号
    this.updateUI();
    this.updateSignals();

    logSignal('Level Started', {
      level: this.currentLevel,
      enemyCount: this.getEnemyCount(this.currentLevel)
    });
  }

  showMessage(text, callback) {
    // 暂停游戏
    this.physics.pause();

    if (this.messageText) {
      this.messageText.destroy();
    }

    this.messageText = this.add.text(400, 300, text, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 20 },
      align: 'center'
    });
    this.messageText.setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      if (this.messageText) {
        this.messageText.destroy();
        this.messageText = null;
      }
      this.physics.resume();
      if (callback) {
        callback();
      }
    });
  }

  createUI() {
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#00ffff'
    });

    this.add.text(16, 550, '使用方向键移动，碰撞消灭敌人', {
      fontSize: '18px',
      fill: '#aaaaaa'
    });

    this.updateUI();
  }

  updateUI() {
    const totalEnemies = this.getEnemyCount(this.currentLevel);
    const remaining = this.enemies.countActive(true);

    this.levelText.setText(`关卡: ${this.currentLevel} / ${this.maxLevel}`);
    this.enemyCountText.setText(`敌人: ${remaining} / ${totalEnemies}`);
  }

  updateSignals() {
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.enemiesRemaining = this.enemies.countActive(true);
    window.__signals__.totalEnemies = this.getEnemyCount(this.currentLevel);
  }

  update(time, delta) {
    if (!this.player || !this.cursors) {
      return;
    }

    // 玩家移动控制
    const velocity = { x: 0, y: 0 };

    if (this.cursors.left.isDown) {
      velocity.x = -this.playerSpeed;
    } else if (this.cursors.right.isDown) {
      velocity.x = this.playerSpeed;
    }

    if (this.cursors.up.isDown) {
      velocity.y = -this.playerSpeed;
    } else if (this.cursors.down.isDown) {
      velocity.y = this.playerSpeed;
    }

    this.player.setVelocity(velocity.x, velocity.y);

    // 更新UI
    this.updateUI();
  }
}

// 启动游戏
new Phaser.Game(config);