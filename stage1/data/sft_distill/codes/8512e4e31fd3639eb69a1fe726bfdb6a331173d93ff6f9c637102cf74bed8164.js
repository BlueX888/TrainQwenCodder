class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.playerHealth = 3;
    this.gameOver = false;
    this.score = 0;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Boss纹理（红色大方块）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.fillStyle(0x880000, 1);
    bossGraphics.fillRect(10, 10, 60, 60);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 玩家子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('playerBullet', 8, 8);
    bulletGraphics.destroy();

    // Boss子弹纹理（紫色圆）
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
      maxSize: 30
    });

    this.bossBullets = this.physics.add.group({
      defaultKey: 'bossBullet',
      maxSize: 100
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 200;

    // Boss攻击定时器（每2.5秒）
    this.bossAttackTimer = this.time.addEvent({
      delay: 2500,
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
      fill: '#00aaff'
    });

    this.scoreText = this.add.text(16, 84, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    this.statusText.setVisible(false);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    const speed = 300;
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
      this.playerShoot();
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

  playerShoot() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  bossAttack() {
    if (this.gameOver) {
      return;
    }

    // 圆形弹幕模式
    const bulletCount = 12;
    const angleStep = (Math.PI * 2) / bulletCount;
    const bulletSpeed = 200;

    for (let i = 0; i < bulletCount; i++) {
      const angle = angleStep * i;
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y);
      
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        
        const vx = Math.cos(angle) * bulletSpeed;
        const vy = Math.sin(angle) * bulletSpeed;
        bullet.setVelocity(vx, vy);
      }
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.bossHealth--;
    this.score += 100;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });

    if (this.bossHealth <= 0) {
      this.victory();
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.playerHealth <= 0) {
      this.defeat();
    }
  }

  victory() {
    this.gameOver = true;
    this.bossAttackTimer.remove();
    
    this.boss.setVisible(false);
    this.statusText.setText('VICTORY!');
    this.statusText.setVisible(true);
    this.statusText.setColor('#00ff00');

    // 清理所有子弹
    this.bossBullets.clear(true, true);
    this.playerBullets.clear(true, true);

    console.log('Game Over - Victory! Final Score:', this.score);
  }

  defeat() {
    this.gameOver = true;
    this.bossAttackTimer.remove();
    
    this.player.setVisible(false);
    this.statusText.setText('DEFEAT!');
    this.statusText.setVisible(true);
    this.statusText.setColor('#ff0000');

    // 清理所有子弹
    this.bossBullets.clear(true, true);
    this.playerBullets.clear(true, true);

    console.log('Game Over - Defeat! Final Score:', this.score);
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