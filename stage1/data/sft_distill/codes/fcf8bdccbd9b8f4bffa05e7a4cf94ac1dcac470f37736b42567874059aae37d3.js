class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    
    // 可验证的状态信号
    this.playerHealth = 3;
    this.bossHealth = 8;
    this.score = 0;
    this.gameOver = false;
    this.victory = false;
  }

  preload() {
    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 Boss 纹理（红色大方块）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.fillStyle(0x000000, 1);
    bossGraphics.fillRect(20, 30, 15, 15);
    bossGraphics.fillRect(45, 30, 15, 15);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建玩家子弹纹理（黄色小圆）
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0xffff00, 1);
    playerBulletGraphics.fillCircle(4, 4, 4);
    playerBulletGraphics.generateTexture('playerBullet', 8, 8);
    playerBulletGraphics.destroy();

    // 创建 Boss 子弹纹理（紫色菱形）
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.beginPath();
    bossBulletGraphics.moveTo(8, 0);
    bossBulletGraphics.lineTo(16, 8);
    bossBulletGraphics.lineTo(8, 16);
    bossBulletGraphics.lineTo(0, 8);
    bossBulletGraphics.closePath();
    bossBulletGraphics.fillPath();
    bossBulletGraphics.generateTexture('bossBullet', 16, 16);
    bossBulletGraphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x001122, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setImmovable(true);

    // Boss 移动模式（左右移动）
    this.tweens.add({
      targets: this.boss,
      x: 200,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

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

    // 玩家射击冷却
    this.canShoot = true;
    this.shootCooldown = 300;

    // Boss 攻击定时器（每 1.5 秒）
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

    // UI 文本
    this.playerHealthText = this.add.text(16, 16, `Player HP: ${this.playerHealth}`, {
      fontSize: '20px',
      fill: '#00ff00'
    });

    this.bossHealthText = this.add.text(16, 46, `Boss HP: ${this.bossHealth}`, {
      fontSize: '20px',
      fill: '#ff0000'
    });

    this.scoreText = this.add.text(16, 76, `Score: ${this.score}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    const speed = 300;
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

    // 玩家射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.playerShoot();
    }

    // 清理超出屏幕的子弹
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
    this.canShoot = false;

    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-500);
    }

    this.time.delayedCall(this.shootCooldown, () => {
      this.canShoot = true;
    });
  }

  bossAttack() {
    if (this.gameOver) {
      return;
    }

    // Boss 发射多个子弹（扇形攻击）
    const numBullets = 5;
    const angleStep = 30;
    const startAngle = -60;

    for (let i = 0; i < numBullets; i++) {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);

        const angle = startAngle + i * angleStep;
        const radian = Phaser.Math.DegToRad(angle);
        const speed = 200;

        bullet.body.setVelocity(
          Math.sin(radian) * speed,
          Math.cos(radian) * speed
        );
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

    // Boss 受伤闪烁效果
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

    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家受伤闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
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
    this.bossAttackTimer.destroy();

    this.statusText.setText(message);

    // 停止所有移动
    this.player.setVelocity(0);
    this.boss.setVelocity(0);
    this.tweens.killAll();

    // 清理所有子弹
    this.playerBullets.clear(true, true);
    this.bossBullets.clear(true, true);

    // 添加重启提示
    this.time.delayedCall(2000, () => {
      const restartText = this.add.text(400, 360, 'Press SPACE to Restart', {
        fontSize: '24px',
        fill: '#ffff00',
        align: 'center'
      }).setOrigin(0.5);

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart();
      });
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