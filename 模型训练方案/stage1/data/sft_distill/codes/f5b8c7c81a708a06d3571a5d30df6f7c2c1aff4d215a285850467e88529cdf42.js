// 全局信号对象
window.__signals__ = {
  currentLevel: 1,
  enemiesRemaining: 12,
  enemiesDefeated: 0,
  totalLevels: 5,
  gameComplete: false,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 12;
    this.enemyIncrement = 2;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 初始化当前关卡的敌人数量
    this.totalEnemies = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    this.enemiesRemaining = this.totalEnemies;

    // 更新全局信号
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;
    window.__signals__.logs.push({
      time: Date.now(),
      event: 'level_start',
      level: this.currentLevel,
      enemies: this.totalEnemies
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    this.spawnEnemies();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 48, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(400, 300, '使用方向键移动，触碰敌人消灭它们', {
      fontSize: '18px',
      fill: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 3秒后隐藏提示
    this.time.delayedCall(3000, () => {
      this.instructionText.setVisible(false);
    });

    this.updateUI();

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  spawnEnemies() {
    // 使用固定种子生成敌人位置（基于关卡数）
    const seed = this.currentLevel * 1000;
    let randomValue = seed;

    const seededRandom = () => {
      randomValue = (randomValue * 9301 + 49297) % 233280;
      return randomValue / 233280;
    };

    for (let i = 0; i < this.totalEnemies; i++) {
      const x = 50 + seededRandom() * 700;
      const y = 50 + seededRandom() * 350;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 给敌人随机速度
      const velocityX = (seededRandom() - 0.5) * 100;
      const velocityY = (seededRandom() - 0.5) * 100;
      enemy.setVelocity(velocityX, velocityY);
    }
  }

  hitEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.enemiesRemaining--;

    // 更新全局信号
    window.__signals__.enemiesRemaining = this.enemiesRemaining;
    window.__signals__.enemiesDefeated++;
    window.__signals__.logs.push({
      time: Date.now(),
      event: 'enemy_defeated',
      level: this.currentLevel,
      remaining: this.enemiesRemaining
    });

    this.updateUI();

    // 检查是否清空所有敌人
    if (this.enemiesRemaining === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    window.__signals__.logs.push({
      time: Date.now(),
      event: 'level_complete',
      level: this.currentLevel
    });

    if (this.currentLevel >= this.maxLevel) {
      // 游戏通关
      this.gameComplete();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.showLevelTransition();
    }
  }

  showLevelTransition() {
    // 显示过关提示
    const transitionText = this.add.text(400, 300, `第 ${this.currentLevel - 1} 关完成！\n准备进入第 ${this.currentLevel} 关...`, {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 2秒后重启场景
    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }

  gameComplete() {
    window.__signals__.gameComplete = true;
    window.__signals__.logs.push({
      time: Date.now(),
      event: 'game_complete'
    });

    // 显示胜利信息
    const victoryText = this.add.text(400, 300, '恭喜通关！\n你完成了全部 5 关！', {
      fontSize: '36px',
      fill: '#ffd700',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 禁用玩家控制
    this.physics.pause();
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`剩余敌人: ${this.enemiesRemaining}/${this.totalEnemies}`);
  }

  update(time, delta) {
    if (!this.player || !this.player.active) {
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

new Phaser.Game(config);