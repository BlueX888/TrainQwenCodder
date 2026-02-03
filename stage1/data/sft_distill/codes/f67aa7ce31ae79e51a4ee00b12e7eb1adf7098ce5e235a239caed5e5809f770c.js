class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
    this.bossHealth = 12;
    this.playerHealth = 3;
    this.gameOver = false;
    this.victory = false;
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
    bossGraphics.fillStyle(0x000000, 1);
    bossGraphics.fillCircle(20, 25, 8);
    bossGraphics.fillCircle(60, 25, 8);
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
    this.boss.setImmovable(true);

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 20
    });

    this.bossBullets = this.physics.add.group({
      defaultKey: 'bossBullet',
      maxSize: 50
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 玩家射击冷却
    this.canShoot = true;
    this.shootCooldown = 250;

    // Boss攻击定时器（每1秒）
    this.bossAttackTimer = this.time.addEvent({
      delay: 1000,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // Boss攻击模式索引
    this.attackPatternIndex = 0;

    // 碰撞检测
    this.physics.add.overlap(
      this.playerBullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.bossBullets,
      this.hitPlayer,
      null,
      this
    );

    // UI文本
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.playerHealthText = this.add.text(16, 50, `Player HP: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#fff'
    }).setOrigin(0.5);

    // 随机种子（可选，用于确定性）
    this.seed = 12345;
  }

  update(time, delta) {
    if (this.gameOver || this.victory) {
      return;
    }

    // 玩家移动
    const speed = 250;
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

    // 玩家射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shootPlayerBullet();
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // 清理超出边界的子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossBullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y > 610 || bullet.x < -10 || bullet.x > 810)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  shootPlayerBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  bossAttack() {
    if (this.gameOver || this.victory) {
      return;
    }

    // 三种攻击模式轮换
    const patterns = [
      this.spreadPattern.bind(this),
      this.circlePattern.bind(this),
      this.targetedPattern.bind(this)
    ];

    patterns[this.attackPatternIndex]();
    this.attackPatternIndex = (this.attackPatternIndex + 1) % patterns.length;
  }

  // 攻击模式1：扇形散射
  spreadPattern() {
    const angles = [-60, -30, 0, 30, 60];
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const rad = Phaser.Math.DegToRad(angle + 90);
        const speed = 200;
        bullet.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
      }
    });
  }

  // 攻击模式2：圆形弹幕
  circlePattern() {
    const bulletCount = 8;
    for (let i = 0; i < bulletCount; i++) {
      const angle = (360 / bulletCount) * i;
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const rad = Phaser.Math.DegToRad(angle);
        const speed = 150;
        bullet.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
      }
    }
  }

  // 攻击模式3：追踪玩家
  targetedPattern() {
    const bulletCount = 3;
    for (let i = 0; i < bulletCount; i++) {
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
        const offsetAngle = angle + Phaser.Math.DegToRad((i - 1) * 15);
        const speed = 220;
        bullet.setVelocity(
          Math.cos(offsetAngle) * speed,
          Math.sin(offsetAngle) * speed
        );
      }
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.bossHealth--;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.bossAttackTimer.remove();
      boss.setVisible(false);
      this.statusText.setText('VICTORY!');
      
      // 清理所有Boss子弹
      this.bossBullets.clear(true, true);
    }
  }

  hitPlayer(player, bullet) {
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
      this.gameOver = true;
      this.bossAttackTimer.remove();
      player.setVisible(false);
      this.statusText.setText('GAME OVER');
      
      // 停止所有子弹
      this.playerBullets.clear(true, true);
      this.bossBullets.clear(true, true);
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
  scene: BossScene
};

new Phaser.Game(config);