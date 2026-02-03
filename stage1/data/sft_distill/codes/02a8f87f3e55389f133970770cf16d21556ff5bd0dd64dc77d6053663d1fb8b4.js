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
    this.bossDirection = 1;
    this.bossSpeed = 100;

    // 创建子弹组
    this.playerBullets = this.physics.add.group();
    this.bossBullets = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastPlayerShot = 0;

    // Boss攻击定时器
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
  }

  createTextures() {
    // 玩家纹理 (绿色三角形)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Boss纹理 (红色大矩形)
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 60);
    bossGraphics.fillStyle(0xffff00, 1);
    bossGraphics.fillCircle(20, 20, 8);
    bossGraphics.fillCircle(60, 20, 8);
    bossGraphics.generateTexture('boss', 80, 60);
    bossGraphics.destroy();

    // 玩家子弹纹理 (蓝色小圆)
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0x00ffff, 1);
    playerBulletGraphics.fillCircle(4, 4, 4);
    playerBulletGraphics.generateTexture('playerBullet', 8, 8);
    playerBulletGraphics.destroy();

    // Boss子弹纹理 (橙色圆)
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff6600, 1);
    bossBulletGraphics.fillCircle(6, 6, 6);
    bossBulletGraphics.generateTexture('bossBullet', 12, 12);
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

    // 玩家射击 (每200ms一次)
    if (this.spaceKey.isDown && time > this.lastPlayerShot + 200) {
      this.playerShoot();
      this.lastPlayerShot = time;
    }

    // Boss左右移动
    this.boss.x += this.bossSpeed * this.bossDirection * (delta / 1000);
    if (this.boss.x >= 750 || this.boss.x <= 50) {
      this.bossDirection *= -1;
    }

    // 清理超出边界的子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.y < -10) {
        bullet.destroy();
      }
    });

    this.bossBullets.children.entries.forEach(bullet => {
      if (bullet.y > 610) {
        bullet.destroy();
      }
    });
  }

  playerShoot() {
    const bullet = this.playerBullets.create(this.player.x, this.player.y - 20, 'playerBullet');
    bullet.setVelocityY(-400);
  }

  bossAttack() {
    if (this.gameOver) {
      return;
    }

    // Boss发射5个扇形弹幕
    const angleStep = 30;
    const startAngle = -60;
    
    for (let i = 0; i < 5; i++) {
      const angle = startAngle + i * angleStep;
      const bullet = this.bossBullets.create(this.boss.x, this.boss.y + 30, 'bossBullet');
      
      const radians = Phaser.Math.DegToRad(angle + 90);
      const velocityX = Math.cos(radians) * 250;
      const velocityY = Math.sin(radians) * 250;
      
      bullet.setVelocity(velocityX, velocityY);
    }
  }

  hitBoss(bullet, boss) {
    bullet.destroy();
    this.bossHealth--;
    this.score += 100;
    
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss受击闪烁
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
    bullet.destroy();
    this.playerHealth--;
    
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家受击闪烁
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });

    if (this.playerHealth <= 0) {
      this.endGame('GAME OVER!');
    }
  }

  endGame(message) {
    this.gameOver = true;
    this.statusText.setText(message);
    
    // 停止Boss攻击
    this.bossAttackTimer.destroy();
    
    // 停止所有物理对象
    this.player.setVelocity(0, 0);
    this.boss.setVelocity(0, 0);
    this.playerBullets.children.entries.forEach(bullet => bullet.setVelocity(0, 0));
    this.bossBullets.children.entries.forEach(bullet => bullet.setVelocity(0, 0));

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