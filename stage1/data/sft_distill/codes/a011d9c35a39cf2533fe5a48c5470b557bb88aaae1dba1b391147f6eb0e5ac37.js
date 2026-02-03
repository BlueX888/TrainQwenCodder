class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 5;
    this.playerHealth = 3;
    this.gameOver = false;
    this.victory = false;
    this.score = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setImmovable(true);

    // Boss移动模式
    this.tweens.add({
      targets: this.boss,
      x: 200,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 10
    });

    this.bossBullets = this.physics.add.group({
      defaultKey: 'bossBullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // Boss攻击定时器 - 每1.5秒发射攻击
    this.bossAttackTimer = this.time.addEvent({
      delay: 1500,
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
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#ff0000'
    });

    this.playerHealthText = this.add.text(16, 50, `Player HP: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#00ff00'
    });

    this.scoreText = this.add.text(16, 84, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00'
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);
  }

  createTextures() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.fillStyle(0x00aa00, 1);
    playerGraphics.fillTriangle(16, 0, 8, 10, 24, 10);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 64, 64);
    bossGraphics.fillStyle(0xaa0000, 1);
    bossGraphics.fillCircle(16, 16, 8);
    bossGraphics.fillCircle(48, 16, 8);
    bossGraphics.fillRect(16, 48, 32, 8);
    bossGraphics.generateTexture('boss', 64, 64);
    bossGraphics.destroy();

    // 创建玩家子弹纹理
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0x00ffff, 1);
    playerBulletGraphics.fillRect(0, 0, 8, 16);
    playerBulletGraphics.generateTexture('playerBullet', 8, 16);
    playerBulletGraphics.destroy();

    // 创建Boss子弹纹理
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillCircle(8, 8, 8);
    bossBulletGraphics.generateTexture('bossBullet', 16, 16);
    bossBulletGraphics.destroy();
  }

  update(time, delta) {
    if (this.gameOver) {
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
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.playerShoot();
      this.lastFired = time;
    }

    // 清理越界子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y > 620) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  playerShoot() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -400;
    }
  }

  bossAttack() {
    if (this.gameOver) {
      return;
    }

    // Boss发射3发扇形子弹
    const angles = [-30, 0, 30];
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 32);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        
        const rad = Phaser.Math.DegToRad(90 + angle);
        const speed = 250;
        bullet.body.velocity.x = Math.cos(rad) * speed;
        bullet.body.velocity.y = Math.sin(rad) * speed;
      }
    });
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();

    this.bossHealth--;
    this.score += 100;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.endGame('VICTORY!');
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();

    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.playerHealth <= 0) {
      this.victory = false;
      this.endGame('GAME OVER');
    }
  }

  endGame(message) {
    this.gameOver = true;
    this.bossAttackTimer.remove();
    
    this.statusText.setText(message);
    this.statusText.setVisible(true);

    // 停止所有移动
    this.player.body.stop();
    this.boss.body.stop();
    this.tweens.killAll();

    // 清除所有子弹
    this.playerBullets.clear(true, true);
    this.bossBullets.clear(true, true);

    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
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
  scene: BossBattleScene
};

new Phaser.Game(config);