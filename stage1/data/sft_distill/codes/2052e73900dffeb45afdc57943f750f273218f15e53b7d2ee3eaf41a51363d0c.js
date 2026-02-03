class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
    this.bossHealth = 20;
    this.maxBossHealth = 20;
    this.playerHealth = 3;
    this.gameOver = false;
    this.victory = false;
    this.score = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建玩家子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('playerBullet', 8, 8);
    bulletGraphics.destroy();

    // 创建Boss子弹纹理
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillCircle(6, 6, 6);
    bossBulletGraphics.generateTexture('bossBullet', 12, 12);
    bossBulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setImmovable(true);

    // Boss移动模式（左右移动）
    this.bossDirection = 1;
    this.bossSpeed = 100;

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 20
    });

    this.bossBullets = this.physics.add.group({
      defaultKey: 'bossBullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 射击冷却
    this.canShoot = true;
    this.shootDelay = 300;

    // Boss攻击定时器 - 每3秒发射攻击
    this.bossAttackTimer = this.time.addEvent({
      delay: 3000,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.playerBullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    this.physics.add.overlap(
      this.bossBullets,
      this.player,
      this.hitPlayer,
      null,
      this
    );

    // UI文本
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    this.playerHealthText = this.add.text(16, 46, `Player HP: ${this.playerHealth}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    this.scoreText = this.add.text(16, 76, `Score: ${this.score}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#fff'
    });
    this.statusText.setOrigin(0.5);

    // Boss血量条
    this.createHealthBar();
  }

  createHealthBar() {
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(300, 20, 200, 20);

    this.healthBar = this.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 200 * healthPercent;
    
    if (healthPercent > 0.5) {
      this.healthBar.fillStyle(0x00ff00, 1);
    } else if (healthPercent > 0.25) {
      this.healthBar.fillStyle(0xffff00, 1);
    } else {
      this.healthBar.fillStyle(0xff0000, 1);
    }
    
    this.healthBar.fillRect(300, 20, barWidth, 20);
  }

  bossAttack() {
    if (this.gameOver || this.victory) return;

    // Boss发射多个子弹（扇形弹幕）
    const bulletCount = 8;
    const angleStep = Math.PI / (bulletCount - 1);
    const startAngle = Math.PI / 2; // 向下

    for (let i = 0; i < bulletCount; i++) {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        
        const angle = startAngle + (i - bulletCount / 2) * angleStep / 2;
        const speed = 200;
        
        bullet.body.velocity.x = Math.cos(angle) * speed;
        bullet.body.velocity.y = Math.sin(angle) * speed;

        // 子弹超出屏幕后回收
        this.time.delayedCall(5000, () => {
          if (bullet.active) {
            bullet.setActive(false);
            bullet.setVisible(false);
          }
        });
      }
    }
  }

  shootPlayerBullet() {
    if (!this.canShoot || this.gameOver || this.victory) return;

    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -400;

      this.canShoot = false;
      this.time.delayedCall(this.shootDelay, () => {
        this.canShoot = true;
      });

      // 子弹超出屏幕后回收
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.bossHealth -= 1;
    this.score += 10;
    
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);
    this.updateHealthBar();

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.endGame('VICTORY!');
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.playerHealth -= 1;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家受击闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.endGame('GAME OVER');
    }
  }

  endGame(message) {
    this.statusText.setText(message);
    this.bossAttackTimer.destroy();
    
    if (this.victory) {
      this.boss.setVisible(false);
      this.boss.setActive(false);
    }

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver || this.victory) return;

    // 玩家移动
    const speed = 250;
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.velocity.x = -speed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.velocity.x = speed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.body.velocity.y = -speed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.body.velocity.y = speed;
    }

    // 玩家射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shootPlayerBullet();
    }

    // Boss移动（左右移动）
    this.boss.x += this.bossSpeed * this.bossDirection * delta / 1000;
    
    if (this.boss.x <= 100 || this.boss.x >= 700) {
      this.bossDirection *= -1;
    }

    // 清理超出屏幕的子弹
    this.playerBullets.children.each((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossBullets.children.each((bullet) => {
      if (bullet.active && (bullet.y > 610 || bullet.x < -10 || bullet.x > 810)) {
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
  scene: BossScene
};

new Phaser.Game(config);