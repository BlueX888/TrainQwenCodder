// 游戏状态信号
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 5,
  enemiesRemaining: 0,
  enemiesKilled: 0,
  gameCompleted: false,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemies = 12;
    this.enemiesPerLevel = 2;
    this.player = null;
    this.enemies = null;
    this.bullets = null;
    this.cursors = null;
    this.fireKey = null;
    this.lastFired = 0;
    this.fireRate = 200;
    this.enemiesRemaining = 0;
    this.levelText = null;
    this.enemyCountText = null;
    this.statusText = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
    
    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    
    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
    this.statusText.setVisible(false);
    
    // 开始第一关
    this.startLevel(this.currentLevel);
    
    this.logSignal(`Game started - Level 1`);
  }

  createTextures() {
    // 创建玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(32, 32);
    playerGraphics.lineTo(0, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
    
    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  startLevel(level) {
    this.currentLevel = level;
    
    // 清除现有敌人
    this.enemies.clear(true, true);
    
    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemies + (level - 1) * this.enemiesPerLevel;
    this.enemiesRemaining = enemyCount;
    
    // 生成敌人（使用固定模式保证确定性）
    const cols = Math.ceil(Math.sqrt(enemyCount));
    const rows = Math.ceil(enemyCount / cols);
    const spacingX = 60;
    const spacingY = 50;
    const startX = 400 - (cols * spacingX) / 2;
    const startY = 80;
    
    let count = 0;
    for (let row = 0; row < rows && count < enemyCount; row++) {
      for (let col = 0; col < cols && count < enemyCount; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(20, 50)
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        count++;
      }
    }
    
    // 更新UI
    this.updateUI();
    
    // 更新信号
    window.__signals__.currentLevel = level;
    window.__signals__.enemiesRemaining = enemyCount;
    
    this.logSignal(`Level ${level} started with ${enemyCount} enemies`);
  }

  update(time, delta) {
    if (!this.player.active) return;
    
    // 玩家移动
    this.player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }
    
    // 射击
    if (this.fireKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }
    
    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    // 更新计数
    this.enemiesRemaining--;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;
    window.__signals__.enemiesKilled++;
    
    this.updateUI();
    
    this.logSignal(`Enemy killed - Remaining: ${this.enemiesRemaining}`);
    
    // 检查关卡完成
    if (this.enemiesRemaining <= 0) {
      this.levelComplete();
    }
  }

  playerHit(player, enemy) {
    // 简单的游戏结束逻辑
    this.logSignal(`Player hit by enemy - Game Over`);
    this.gameOver();
  }

  levelComplete() {
    this.logSignal(`Level ${this.currentLevel} completed`);
    
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.gameWin();
    } else {
      // 进入下一关
      this.showLevelTransition();
    }
  }

  showLevelTransition() {
    this.statusText.setText(`Level ${this.currentLevel} Complete!\nNext Level in 2s...`);
    this.statusText.setVisible(true);
    
    this.time.delayedCall(2000, () => {
      this.statusText.setVisible(false);
      this.startLevel(this.currentLevel + 1);
    });
  }

  gameWin() {
    window.__signals__.gameCompleted = true;
    this.logSignal('All levels completed - Game Win!');
    
    this.player.setActive(false);
    this.enemies.clear(true, true);
    this.bullets.clear(true, true);
    
    this.statusText.setText('YOU WIN!\nAll 5 Levels Completed!');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);
  }

  gameOver() {
    this.logSignal('Game Over');
    
    this.player.setActive(false);
    this.player.setTint(0xff0000);
    
    this.statusText.setText('GAME OVER');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  logSignal(message) {
    const log = {
      timestamp: Date.now(),
      level: this.currentLevel,
      enemiesRemaining: this.enemiesRemaining,
      message: message
    };
    window.__signals__.logs.push(log);
    console.log('[SIGNAL]', JSON.stringify(log));
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

// 启动游戏
new Phaser.Game(config);