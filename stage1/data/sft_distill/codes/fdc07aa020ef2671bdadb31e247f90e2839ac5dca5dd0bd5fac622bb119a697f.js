class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 20;
    this.enemyIncrement = 2;
    this.remainingEnemies = 0;
    this.player = null;
    this.enemies = null;
    this.bullets = null;
    this.cursors = null;
    this.fireKey = null;
    this.lastFired = 0;
    this.fireRate = 200;
    this.levelText = null;
    this.enemyText = null;
    this.gameOverText = null;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

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

    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyText = this.add.text(16, 48, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    // 清除现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (level - 1) * this.enemyIncrement;
    this.remainingEnemies = enemyCount;

    // 使用固定种子生成敌人位置（确保确定性）
    const seed = level * 12345;
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

    // 更新UI
    this.updateUI();
  }

  seededRandom(seed) {
    let current = seed;
    return function() {
      current = (current * 9301 + 49297) % 233280;
      return current / 233280;
    };
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();

    // 减少剩余敌人数
    this.remainingEnemies--;

    // 更新UI
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.remainingEnemies <= 0) {
      this.completeLevel();
    }
  }

  completeLevel() {
    // 进入下一关
    this.currentLevel++;

    if (this.currentLevel > this.maxLevel) {
      // 游戏胜利
      this.showGameOver(true);
    } else {
      // 开始下一关
      this.time.delayedCall(1000, () => {
        this.startLevel(this.currentLevel);
      });
    }
  }

  showGameOver(victory) {
    // 停止游戏
    this.physics.pause();

    if (this.gameOverText) {
      this.gameOverText.destroy();
    }

    const message = victory 
      ? 'VICTORY! All 5 Levels Completed!' 
      : 'Game Over';

    this.gameOverText = this.add.text(400, 300, message, {
      fontSize: '48px',
      fill: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyText.setText(`Enemies: ${this.remainingEnemies}`);
  }

  fireBullet() {
    const time = this.time.now;

    if (time > this.lastFired + this.fireRate) {
      const bullet = this.bullets.get(this.player.x, this.player.y - 20);

      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-400);

        this.lastFired = time;
      }
    }
  }

  update(time, delta) {
    if (this.physics.world.isPaused) {
      return;
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

    // 射击
    if (this.fireKey.isDown) {
      this.fireBullet();
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
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