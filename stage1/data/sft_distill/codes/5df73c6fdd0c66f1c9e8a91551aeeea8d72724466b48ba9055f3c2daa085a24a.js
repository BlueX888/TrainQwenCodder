class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.remainingEnemies = 0;
    this.playerHealth = 3;
    this.score = 0;
    this.seedValue = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化关卡
    this.startLevel(this.currentLevel);

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

    // 生成敌人
    this.spawnEnemies();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 300;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '20px',
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

    this.healthText = this.add.text(16, 84, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.scoreText = this.add.text(16, 118, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateUI();

    // 游戏状态
    this.gameOver = false;
    this.levelComplete = false;
  }

  update(time, delta) {
    if (this.gameOver || this.levelComplete) {
      return;
    }

    // 玩家移动
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 射击
    if (this.wasd.space.isDown && this.canShoot) {
      this.shoot();
    }

    // 敌人移动（简单的追踪玩家）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        const enemySpeed = 80 + (this.currentLevel - 1) * 10; // 难度递增
        enemy.setVelocity(
          Math.cos(angle) * enemySpeed,
          Math.sin(angle) * enemySpeed
        );
      }
    });

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (
        bullet.x < 0 || bullet.x > 800 ||
        bullet.y < 0 || bullet.y > 600
      )) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  startLevel(level) {
    this.currentLevel = level;
    this.enemiesPerLevel = 8 + (level - 1) * 2;
    this.remainingEnemies = this.enemiesPerLevel;
    this.levelComplete = false;
  }

  spawnEnemies() {
    // 使用固定种子生成随机位置
    const rng = this.createSeededRandom(this.seedValue + this.currentLevel);
    
    for (let i = 0; i < this.enemiesPerLevel; i++) {
      const x = rng() * 700 + 50; // 50-750
      const y = rng() * 300 + 50; // 50-350 (上半部分)
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    enemy.destroy();
    
    this.remainingEnemies--;
    this.score += 10;
    this.updateUI();

    // 检查是否完成关卡
    if (this.remainingEnemies <= 0) {
      this.completeLevel();
    }
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    this.remainingEnemies--;
    
    this.playerHealth--;
    this.updateUI();

    // 玩家受伤闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    if (this.playerHealth <= 0) {
      this.endGame(false);
    }
  }

  completeLevel() {
    this.levelComplete = true;
    
    const message = this.currentLevel < this.maxLevel
      ? `Level ${this.currentLevel} Complete!\nNext Level in 2s...`
      : 'All Levels Complete!\nYou Win!';
    
    const completeText = this.add.text(400, 300, message, {
      fontSize: '32px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    completeText.setOrigin(0.5);

    if (this.currentLevel < this.maxLevel) {
      this.time.delayedCall(2000, () => {
        completeText.destroy();
        this.nextLevel();
      });
    } else {
      this.gameOver = true;
    }
  }

  nextLevel() {
    // 清理当前关卡
    this.enemies.clear(true, true);
    this.bullets.clear(true, true);
    
    // 开始下一关
    this.startLevel(this.currentLevel + 1);
    this.spawnEnemies();
    
    // 重置玩家位置
    this.player.setPosition(400, 500);
    this.player.setVelocity(0);
    
    this.updateUI();
  }

  endGame(won) {
    this.gameOver = true;
    
    const message = won ? 'You Win!' : 'Game Over!';
    const color = won ? '#00ff00' : '#ff0000';
    
    const gameOverText = this.add.text(400, 300, message, {
      fontSize: '48px',
      fill: color,
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}/${this.enemiesPerLevel}`);
    this.healthText.setText(`Health: ${this.playerHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  // 创建固定种子的随机数生成器
  createSeededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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