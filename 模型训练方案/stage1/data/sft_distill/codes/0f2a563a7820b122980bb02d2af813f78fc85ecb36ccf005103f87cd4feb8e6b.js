class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态变量（可验证）
    this.currentWave = 1;
    this.killCount = 0;
    this.playerHealth = 100;
    this.enemiesRemaining = 0;
    this.baseEnemyCount = 15;
    this.baseEnemySpeed = 160;
    this.isGameOver = false;
    
    // 随机种子（确定性）
    this.seed = 12345;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 12);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
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
      maxSize: 30
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.killText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyText = this.add.text(16, 84, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.healthText = this.add.text(16, 118, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 开始第一波
    this.startWave();
    this.updateUI();
  }

  update(time, delta) {
    if (this.isGameOver) {
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

    // 检查是否完成当前波次
    if (this.enemiesRemaining === 0 && this.enemies.countActive(true) === 0) {
      this.currentWave++;
      this.startWave();
    }

    this.updateUI();
  }

  startWave() {
    const enemyCount = this.baseEnemyCount + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    this.enemiesRemaining = enemyCount;

    // 使用确定性随机数
    const random = this.seededRandom.bind(this);

    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * 500, () => {
        if (this.isGameOver) return;

        const x = random(50, 750);
        const y = random(-100, -50);
        const enemy = this.enemies.create(x, y, 'enemy');
        
        if (enemy) {
          enemy.setVelocity(
            random(-50, 50),
            enemySpeed + random(-20, 20)
          );
          
          // 敌人离开屏幕后销毁
          this.time.delayedCall(10000, () => {
            if (enemy.active && enemy.y > 650) {
              enemy.destroy();
              this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);
            }
          });
        }
      });
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);

      // 子弹离开屏幕后回收
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    this.killCount++;
    this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);
    
    this.playerHealth -= 10;
    
    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.playerHealth <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.playerHealth = 0;
    this.player.setVisible(false);
    
    this.gameOverText.setText(
      `GAME OVER\n\nWave: ${this.currentWave}\nKills: ${this.killCount}\n\nPress R to Restart`
    );
    this.gameOverText.setVisible(true);

    // 重启游戏
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.enemyText.setText(`Enemies: ${this.enemiesRemaining}`);
    this.healthText.setText(`Health: ${this.playerHealth}`);
  }

  // 确定性随机数生成器
  seededRandom(min, max) {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    const rnd = this.seed / 233280;
    return Math.floor(min + rnd * (max - min + 1));
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
  scene: EndlessWaveScene
};

new Phaser.Game(config);