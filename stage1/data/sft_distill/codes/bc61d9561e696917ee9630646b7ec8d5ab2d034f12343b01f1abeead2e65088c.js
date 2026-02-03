class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 3;
    this.playerHealth = 1;
    this.gameOver = false;
    this.victory = false;
    this.score = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(-40, -30, 80, 60);
    bossGraphics.fillStyle(0x8b0000, 1);
    bossGraphics.fillCircle(-25, -15, 8);
    bossGraphics.fillCircle(25, -15, 8);
    bossGraphics.generateTexture('boss', 80, 60);
    bossGraphics.destroy();

    // 创建玩家子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 5);
    bulletGraphics.generateTexture('playerBullet', 10, 10);
    bulletGraphics.destroy();

    // 创建Boss攻击纹理
    const enemyBulletGraphics = this.add.graphics();
    enemyBulletGraphics.fillStyle(0xff00ff, 1);
    enemyBulletGraphics.fillCircle(0, 0, 8);
    enemyBulletGraphics.generateTexture('enemyBullet', 16, 16);
    enemyBulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocity(100, 0);

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 20
    });

    this.enemyBullets = this.physics.add.group({
      defaultKey: 'enemyBullet',
      maxSize: 50
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastShootTime = 0;

    // Boss攻击定时器
    this.bossAttackTimer = this.time.addEvent({
      delay: 1500,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // Boss移动模式
    this.time.addEvent({
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
      this.enemyBullets,
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

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#fff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver || this.victory) {
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
    if (this.spaceKey.isDown && time > this.lastShootTime + 200) {
      this.shootPlayerBullet();
      this.lastShootTime = time;
    }

    // 清理超出屏幕的子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.enemyBullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y > 600 || bullet.x < 0 || bullet.x > 800)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // Boss边界反弹
    if (this.boss.x <= 40 || this.boss.x >= 760) {
      this.boss.body.velocity.x *= -1;
    }
  }

  shootPlayerBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocity(0, -400);
    }
  }

  bossAttack() {
    if (this.gameOver || this.victory) {
      return;
    }

    // Boss发射多方向弹幕
    const patterns = [
      this.spreadPattern,
      this.circularPattern,
      this.aimPattern
    ];

    const patternIndex = Math.floor(this.score / 3) % patterns.length;
    patterns[patternIndex].call(this);
  }

  spreadPattern() {
    // 扇形弹幕
    for (let i = -2; i <= 2; i++) {
      const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 30);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const angle = (Math.PI / 2) + (i * Math.PI / 8);
        bullet.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
      }
    }
  }

  circularPattern() {
    // 环形弹幕
    for (let i = 0; i < 8; i++) {
      const bullet = this.enemyBullets.get(this.boss.x, this.boss.y);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const angle = (i * Math.PI / 4);
        bullet.body.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
      }
    }
  }

  aimPattern() {
    // 瞄准玩家
    for (let i = -1; i <= 1; i++) {
      const bullet = this.enemyBullets.get(this.boss.x, this.boss.y + 30);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const angle = Phaser.Math.Angle.Between(
          this.boss.x, this.boss.y,
          this.player.x, this.player.y
        ) + (i * 0.2);
        bullet.body.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
      }
    }
  }

  changeBossDirection() {
    if (this.gameOver || this.victory) {
      return;
    }

    const speed = 100 + (3 - this.bossHealth) * 50;
    this.boss.body.setVelocityX(Phaser.Math.Between(0, 1) ? speed : -speed);
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.bossHealth--;
    this.score += 100;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss受伤闪烁
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.statusText.setText('VICTORY!');
      this.bossAttackTimer.destroy();
      boss.setVisible(false);
      this.physics.pause();
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.playerHealth--;

    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.statusText.setText('GAME OVER');
      this.bossAttackTimer.destroy();
      player.setTint(0xff0000);
      this.physics.pause();
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
  scene: BossBattleScene
};

new Phaser.Game(config);