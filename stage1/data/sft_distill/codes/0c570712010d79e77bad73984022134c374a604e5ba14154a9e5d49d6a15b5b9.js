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

// 全局信号对象，用于验证游戏状态
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
    this.baseEnemies = 15;
    this.enemiesPerLevelIncrease = 2;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 碰撞检测：玩家碰到敌人（游戏结束）
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);

    // UI 文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemiesText = this.add.text(16, 48, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(400, 580, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '16px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    this.currentLevel = level;
    const enemyCount = this.baseEnemies + (level - 1) * this.enemiesPerLevelIncrease;
    
    // 清空现有敌人
    this.enemies.clear(true, true);

    // 生成敌人
    const seed = level * 1000; // 固定种子确保可重现
    for (let i = 0; i < enemyCount; i++) {
      // 使用伪随机位置（基于种子）
      const x = 50 + ((seed + i * 137) % 700);
      const y = 50 + ((seed + i * 211) % 300);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 200) - 100,
        ((seed + i * 97) % 200) - 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新信号
    window.__signals__.currentLevel = level;
    window.__signals__.enemiesRemaining = enemyCount;
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'level_start',
      level: level,
      enemies: enemyCount
    });

    this.updateUI();
  }

  update(time, delta) {
    if (window.__signals__.gameCompleted) {
      return;
    }

    // 玩家移动
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

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shoot();
      this.lastFired = time;
    }

    // 清理出界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y < 0 || bullet.y > 600 || bullet.x < 0 || bullet.x > 800)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.reset(this.player.x, this.player.y - 20);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    // 更新计数
    window.__signals__.enemiesKilled++;
    window.__signals__.enemiesRemaining = this.enemies.countActive(true);

    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'enemy_killed',
      remaining: window.__signals__.enemiesRemaining
    });

    this.updateUI();

    // 检查是否通关
    if (this.enemies.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'level_complete',
      level: this.currentLevel
    });

    if (this.currentLevel >= this.maxLevel) {
      this.gameComplete();
    } else {
      // 进入下一关
      this.time.delayedCall(1000, () => {
        this.startLevel(this.currentLevel + 1);
      });

      // 显示通关提示
      const congratsText = this.add.text(400, 300, `Level ${this.currentLevel} Complete!`, {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.time.delayedCall(1000, () => {
        congratsText.destroy();
      });
    }
  }

  gameComplete() {
    window.__signals__.gameCompleted = true;
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'game_complete',
      totalKills: window.__signals__.enemiesKilled
    });

    const winText = this.add.text(400, 300, 'ALL LEVELS COMPLETE!\nYOU WIN!', {
      fontSize: '56px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    console.log('Game Complete!', window.__signals__);
  }

  gameOver() {
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'game_over',
      level: this.currentLevel,
      kills: window.__signals__.enemiesKilled
    });

    this.physics.pause();
    this.player.setTint(0xff0000);

    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    console.log('Game Over!', window.__signals__);
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel} / ${this.maxLevel}`);
    this.enemiesText.setText(`Enemies: ${this.enemies.countActive(true)}`);
  }
}

// 启动游戏
new Phaser.Game(config);