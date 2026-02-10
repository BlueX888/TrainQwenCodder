class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 20;
    this.playerHealth = 10;
    this.gameOver = false;
    this.score = 0;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理 - 蓝色三角形
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Boss 纹理 - 红色大方块
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.lineStyle(4, 0x880000);
    bossGraphics.strokeRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 玩家子弹纹理 - 黄色小圆
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0xffff00, 1);
    playerBulletGraphics.fillCircle(4, 4, 4);
    playerBulletGraphics.generateTexture('playerBullet', 8, 8);
    playerBulletGraphics.destroy();

    // Boss 子弹纹理 - 紫色菱形
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillTriangle(8, 0, 16, 8, 8, 16);
    bossBulletGraphics.fillTriangle(8, 0, 0, 8, 8, 16);
    bossBulletGraphics.generateTexture('bossBullet', 16, 16);
    bossBulletGraphics.destroy();
  }

  create() {
    // 背景
    this.add.rectangle(400, 300, 800, 600, 0x001122);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setVelocityX(100); // Boss 左右移动

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
    this.lastFireTime = 0;

    // Boss 攻击定时器
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

    // UI 文本
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      color: '#ff0000',
      fontStyle: 'bold'
    });

    this.playerHealthText = this.add.text(16, 50, `Player HP: ${this.playerHealth}`, {
      fontSize: '24px',
      color: '#00aaff',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 84, `Score: ${this.score}`, {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Boss 血条
    this.bossHealthBar = this.add.graphics();
    this.updateBossHealthBar();
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }

    // 玩家射击
    if (this.spaceKey.isDown && time > this.lastFireTime + 200) {
      this.playerShoot();
      this.lastFireTime = time;
    }

    // Boss 移动逻辑（左右反弹）
    if (this.boss.x <= 40 || this.boss.x >= 760) {
      this.boss.setVelocityX(-this.boss.body.velocity.x);
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

    // Boss 发射多个子弹（扇形攻击）
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

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.bossHealth--;
    this.score += 10;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);
    this.updateBossHealthBar();

    // Boss 受击闪烁
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

    // 玩家受击闪烁
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

  updateBossHealthBar() {
    this.bossHealthBar.clear();
    const barWidth = 200;
    const barHeight = 20;
    const x = 300;
    const y = 16;

    // 背景
    this.bossHealthBar.fillStyle(0x333333, 1);
    this.bossHealthBar.fillRect(x, y, barWidth, barHeight);

    // 血量
    const healthPercent = this.bossHealth / 20;
    const color = healthPercent > 0.5 ? 0xff0000 : healthPercent > 0.25 ? 0xff8800 : 0xffff00;
    this.bossHealthBar.fillStyle(color, 1);
    this.bossHealthBar.fillRect(x, y, barWidth * healthPercent, barHeight);

    // 边框
    this.bossHealthBar.lineStyle(2, 0xffffff);
    this.bossHealthBar.strokeRect(x, y, barWidth, barHeight);
  }

  victory() {
    this.gameOver = true;
    this.bossAttackTimer.destroy();
    
    this.boss.setVelocity(0);
    
    // Boss 爆炸效果
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => {
        this.boss.destroy();
      }
    });

    this.statusText.setText('VICTORY!');
    this.statusText.setColor('#00ff00');

    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }

  defeat() {
    this.gameOver = true;
    this.bossAttackTimer.destroy();
    
    this.player.setVelocity(0);
    this.player.setTint(0x888888);

    this.statusText.setText('DEFEAT!');
    this.statusText.setColor('#ff0000');

    this.time.delayedCall(2000, () => {
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