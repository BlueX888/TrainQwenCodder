class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    
    // 可验证的状态信号
    this.bossHealth = 10;
    this.playerHealth = 3;
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建Boss纹理（红色大方块）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建玩家子弹纹理（蓝色小方块）
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0x00ffff, 1);
    playerBulletGraphics.fillRect(0, 0, 8, 8);
    playerBulletGraphics.generateTexture('playerBullet', 8, 8);
    playerBulletGraphics.destroy();

    // 创建Boss子弹纹理（橙色方块）
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff8800, 1);
    bossBulletGraphics.fillRect(0, 0, 12, 12);
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
    this.boss.setVelocityX(100); // Boss左右移动

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 20
    });

    this.bossBullets = this.physics.add.group({
      defaultKey: 'bossBullet',
      maxSize: 30
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 300; // 毫秒

    // Boss攻击定时器 - 每3秒发射攻击
    this.bossAttackTimer = this.time.addEvent({
      delay: 3000,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // Boss移动模式定时器 - 每2秒改变方向
    this.bossMoveTimer = this.time.addEvent({
      delay: 2000,
      callback: this.changeBossDirection,
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
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.playerHealthText = this.add.text(16, 48, `Player HP: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.scoreText = this.add.text(16, 80, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
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

    // 玩家射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.playerShoot();
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // Boss边界反弹
    if (this.boss.x <= 40 || this.boss.x >= 760) {
      this.boss.setVelocityX(-this.boss.body.velocity.x);
    }

    // 清理越界子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y > 610) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  playerShoot() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  bossAttack() {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // Boss发射多个子弹形成攻击模式
    const patterns = [
      this.bossAttackSpread,
      this.bossAttackDirect,
      this.bossAttackCircle
    ];
    
    // 随机选择一种攻击模式
    const pattern = Phaser.Math.RND.pick(patterns);
    pattern.call(this);
  }

  bossAttackSpread() {
    // 扇形散射
    const angles = [-30, -15, 0, 15, 30];
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const rad = Phaser.Math.DegToRad(90 + angle);
        const speed = 250;
        bullet.setVelocity(
          Math.cos(rad) * speed,
          Math.sin(rad) * speed
        );
      }
    });
  }

  bossAttackDirect() {
    // 直接瞄准玩家
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 200, () => {
        const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 40);
        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          const angle = Phaser.Math.Angle.Between(
            this.boss.x,
            this.boss.y,
            this.player.x,
            this.player.y
          );
          const speed = 300;
          bullet.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
        }
      });
    }
  }

  bossAttackCircle() {
    // 环形发射
    const bulletCount = 8;
    for (let i = 0; i < bulletCount; i++) {
      const angle = (360 / bulletCount) * i;
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const rad = Phaser.Math.DegToRad(angle);
        const speed = 200;
        bullet.setVelocity(
          Math.cos(rad) * speed,
          Math.sin(rad) * speed
        );
      }
    }
  }

  changeBossDirection() {
    if (this.gameOver || this.gameWon) {
      return;
    }
    // 随机改变Boss移动速度
    const speeds = [80, 120, 150];
    const speed = Phaser.Math.RND.pick(speeds);
    this.boss.setVelocityX(this.boss.body.velocity.x > 0 ? speed : -speed);
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.bossHealth--;
    this.score += 100;
    
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.bossHealth <= 0) {
      this.winGame();
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家受击闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.playerHealth <= 0) {
      this.endGame();
    }
  }

  winGame() {
    this.gameWon = true;
    this.boss.setVisible(false);
    this.bossAttackTimer.destroy();
    this.bossMoveTimer.destroy();
    
    this.statusText.setText('YOU WIN!');
    
    console.log('Game Won! Final Score:', this.score);
  }

  endGame() {
    this.gameOver = true;
    this.player.setVisible(false);
    this.bossAttackTimer.destroy();
    this.bossMoveTimer.destroy();
    
    this.statusText.setText('GAME OVER');
    
    console.log('Game Over! Final Score:', this.score);
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
  scene: BossBattleScene
};

new Phaser.Game(config);