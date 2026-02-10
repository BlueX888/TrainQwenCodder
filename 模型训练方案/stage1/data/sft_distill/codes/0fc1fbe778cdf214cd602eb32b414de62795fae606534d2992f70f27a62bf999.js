class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.playerHealth = 3;
    this.gameOver = false;
    this.bossAttackTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理
    this.createPlayerTexture();
    
    // 创建 Boss 纹理
    this.createBossTexture();
    
    // 创建子弹纹理
    this.createBulletTextures();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 80, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(width / 2, 100, 'bossTex');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100); // Boss 左右移动

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBulletTex',
      maxSize: 20
    });

    this.bossBullets = this.physics.add.group({
      defaultKey: 'bossBulletTex',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;

    // Boss 攻击定时器 - 每 1.5 秒攻击一次
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
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });

    this.playerHealthText = this.add.text(16, 50, `Player HP: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });

    this.statusText = this.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillTriangle(16, 0, 0, 32, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  createBossTexture() {
    const graphics = this.add.graphics();
    // Boss 主体
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 80, 60);
    // Boss 眼睛
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(20, 20, 8);
    graphics.fillCircle(60, 20, 8);
    // Boss 嘴巴
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(20, 40, 40, 10);
    graphics.generateTexture('bossTex', 80, 60);
    graphics.destroy();
  }

  createBulletTextures() {
    // 玩家子弹
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0x00ffff, 1);
    playerBulletGraphics.fillCircle(4, 4, 4);
    playerBulletGraphics.generateTexture('playerBulletTex', 8, 8);
    playerBulletGraphics.destroy();

    // Boss 子弹
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillCircle(6, 6, 6);
    bossBulletGraphics.generateTexture('bossBulletTex', 12, 12);
    bossBulletGraphics.destroy();
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 玩家射击
    if (this.spaceKey.isDown && time > this.lastFireTime + 200) {
      this.playerShoot();
      this.lastFireTime = time;
    }

    // Boss 左右移动反弹
    if (this.boss.x <= 40 || this.boss.x >= this.cameras.main.width - 40) {
      this.boss.body.velocity.x *= -1;
    }

    // 清理屏幕外的子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y > this.cameras.main.height + 10) {
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
      bullet.body.setVelocityY(-400);
    }
  }

  bossAttack() {
    if (this.gameOver) return;

    // Boss 发射多个子弹形成攻击模式
    const patterns = [
      this.bossAttackPattern1.bind(this),
      this.bossAttackPattern2.bind(this),
      this.bossAttackPattern3.bind(this)
    ];

    // 随机选择攻击模式
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    pattern();
  }

  // 攻击模式1：直线下落
  bossAttackPattern1() {
    for (let i = -1; i <= 1; i++) {
      const bullet = this.bossBullets.get(this.boss.x + i * 30, this.boss.y + 30);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.body.setVelocityY(200);
      }
    }
  }

  // 攻击模式2：扇形发射
  bossAttackPattern2() {
    const angles = [-45, -22.5, 0, 22.5, 45];
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 30);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const rad = Phaser.Math.DegToRad(angle + 90);
        bullet.body.setVelocity(
          Math.cos(rad) * 200,
          Math.sin(rad) * 200
        );
      }
    });
  }

  // 攻击模式3：追踪玩家
  bossAttackPattern3() {
    for (let i = 0; i < 3; i++) {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 30);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const angle = Phaser.Math.Angle.Between(
          this.boss.x,
          this.boss.y,
          this.player.x,
          this.player.y
        );
        bullet.body.setVelocity(
          Math.cos(angle) * (150 + i * 20),
          Math.sin(angle) * (150 + i * 20)
        );
      }
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.bossHealth--;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);

    // Boss 受击闪烁
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.bossHealth <= 0) {
      this.gameWin();
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家受击闪烁
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.playerHealth <= 0) {
      this.gameEnd('GAME OVER');
    }
  }

  gameWin() {
    this.gameEnd('VICTORY!');
  }

  gameEnd(message) {
    this.gameOver = true;
    this.bossAttackTimer.destroy();
    
    this.physics.pause();
    
    this.statusText.setText(message);
    this.statusText.setVisible(true);

    // 添加重启提示
    this.time.delayedCall(2000, () => {
      const restartText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 60,
        'Press SPACE to Restart',
        { fontSize: '24px', fill: '#ffffff' }
      ).setOrigin(0.5);

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