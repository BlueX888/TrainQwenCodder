// 全局信号对象
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 5,
  enemiesRemaining: 15,
  enemiesDestroyed: 0,
  gameCompleted: false,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 15;
    this.enemyIncrement = 2;
    this.enemiesRemaining = 0;
    this.enemiesDestroyed = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 20);
    playerGraphics.lineTo(15, 20);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置碰撞
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.lastFired = 0;

    // UI 文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    this.currentLevel = level;
    const enemyCount = this.baseEnemyCount + (level - 1) * this.enemyIncrement;
    this.enemiesRemaining = enemyCount;
    this.enemiesDestroyed = 0;

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定种子确保可重现）
    const seed = level * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 伪随机位置（确定性）
      const x = ((seed + i * 137) % 700) + 50;
      const y = ((seed + i * 239) % 200) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 97) % 200) - 100,
        ((seed + i * 173) % 100) + 50
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    this.updateUI();
    this.updateSignals();

    // 显示关卡开始信息
    this.messageText.setText(`Level ${level}\nEnemies: ${enemyCount}`);
    this.time.delayedCall(2000, () => {
      this.messageText.setText('');
    });

    window.__signals__.logs.push({
      event: 'level_start',
      level: level,
      enemyCount: enemyCount,
      timestamp: Date.now()
    });
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    this.enemiesRemaining--;
    this.enemiesDestroyed++;
    this.updateUI();
    this.updateSignals();

    window.__signals__.logs.push({
      event: 'enemy_destroyed',
      level: this.currentLevel,
      remaining: this.enemiesRemaining,
      timestamp: Date.now()
    });

    // 检查是否通关
    if (this.enemiesRemaining === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel < this.maxLevel) {
      // 进入下一关
      this.messageText.setText(`Level ${this.currentLevel} Complete!\nNext Level...`);
      
      window.__signals__.logs.push({
        event: 'level_complete',
        level: this.currentLevel,
        timestamp: Date.now()
      });

      this.time.delayedCall(2000, () => {
        this.startLevel(this.currentLevel + 1);
      });
    } else {
      // 游戏完成
      this.gameComplete();
    }
  }

  gameComplete() {
    this.messageText.setText('Congratulations!\nAll Levels Complete!');
    window.__signals__.gameCompleted = true;
    window.__signals__.logs.push({
      event: 'game_complete',
      timestamp: Date.now()
    });

    // 停止游戏逻辑
    this.physics.pause();
    
    console.log('=== GAME COMPLETED ===');
    console.log('Total Levels:', this.maxLevel);
    console.log('Total Enemies Destroyed:', this.enemiesDestroyed);
    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  updateUI() {
    this.levelText.setText(
      `Level: ${this.currentLevel}/${this.maxLevel}`
    );
    this.enemyCountText.setText(
      `Enemies: ${this.enemiesRemaining}`
    );
  }

  updateSignals() {
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.totalLevels = this.maxLevel;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;
    window.__signals__.enemiesDestroyed = this.enemiesDestroyed;
  }

  update(time, delta) {
    if (this.physics.world.isPaused) {
      return; // 游戏完成后停止更新
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 清理屏幕外的子弹
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
      bullet.body.velocity.y = -400;
    }
  }
}

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

const game = new Phaser.Game(config);

// 输出初始状态
console.log('Game Started - Initial State:');
console.log(JSON.stringify(window.__signals__, null, 2));