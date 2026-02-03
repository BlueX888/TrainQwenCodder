// Boss战游戏 - 完整实现
class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.playerHealth = 3;
    this.score = 0;
    this.gameOver = false;
    this.victory = false;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      bossHealth: this.bossHealth,
      playerHealth: this.playerHealth,
      score: this.score,
      gameOver: false,
      victory: false,
      events: []
    };

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
      ease: 'Sine.inOut'
    });

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 10
    });

    this.bossBullets = this.physics.add.group({
      defaultKey: 'bossBullet',
      maxSize: 30
    });

    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;

    // Boss攻击定时器
    this.bossAttackTimer = this.time.addEvent({
      delay: 1000,
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
    }).setOrigin(0.5);

    // 添加游戏开始事件
    this.logEvent('gameStart', { bossHealth: this.bossHealth, playerHealth: this.playerHealth });
  }

  update(time, delta) {
    if (this.gameOver || this.victory) {
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

    // 玩家发射子弹
    if (this.spaceKey.isDown && time > this.lastFireTime + 300) {
      this.firePlayerBullet();
      this.lastFireTime = time;
    }

    // 清理超出屏幕的子弹
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

  createTextures() {
    // 玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 60);
    bossGraphics.fillStyle(0x8b0000, 1);
    bossGraphics.fillCircle(20, 20, 8);
    bossGraphics.fillCircle(60, 20, 8);
    bossGraphics.generateTexture('boss', 80, 60);
    bossGraphics.destroy();

    // 玩家子弹纹理
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0x00ffff, 1);
    playerBulletGraphics.fillCircle(4, 4, 4);
    playerBulletGraphics.generateTexture('playerBullet', 8, 8);
    playerBulletGraphics.destroy();

    // Boss子弹纹理
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillCircle(6, 6, 6);
    bossBulletGraphics.generateTexture('bossBullet', 12, 12);
    bossBulletGraphics.destroy();
  }

  firePlayerBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocity(0, -400);
      this.logEvent('playerFire', { x: bullet.x, y: bullet.y });
    }
  }

  bossAttack() {
    if (this.gameOver || this.victory) {
      return;
    }

    // Boss发射多种攻击模式
    const attackPattern = Phaser.Math.Between(0, 2);
    
    switch (attackPattern) {
      case 0: // 直线攻击
        this.bossAttackStraight();
        break;
      case 1: // 扇形攻击
        this.bossAttackSpread();
        break;
      case 2: // 追踪攻击
        this.bossAttackHoming();
        break;
    }

    this.logEvent('bossAttack', { pattern: attackPattern, bossX: this.boss.x });
  }

  bossAttackStraight() {
    const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 30);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocity(0, 250);
    }
  }

  bossAttackSpread() {
    const angles = [-30, -15, 0, 15, 30];
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 30);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const rad = Phaser.Math.DegToRad(angle);
        bullet.body.setVelocity(Math.sin(rad) * 200, Math.cos(rad) * 250);
      }
    });
  }

  bossAttackHoming() {
    const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 30);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      const angle = Phaser.Math.Angle.Between(
        bullet.x, bullet.y,
        this.player.x, this.player.y
      );
      bullet.body.setVelocity(
        Math.cos(angle) * 200,
        Math.sin(angle) * 200
      );
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.bossHealth--;
    this.score += 100;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // 闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true
    });

    this.logEvent('bossHit', { 
      bossHealth: this.bossHealth, 
      score: this.score 
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.endGame(true);
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    this.logEvent('playerHit', { 
      playerHealth: this.playerHealth 
    });

    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.endGame(false);
    }
  }

  endGame(victory) {
    this.bossAttackTimer.remove();
    this.player.setVelocity(0, 0);
    this.boss.setVelocity(0, 0);

    if (victory) {
      this.statusText.setText('VICTORY!');
      this.statusText.setColor('#00ff00');
      this.tweens.add({
        targets: this.boss,
        alpha: 0,
        angle: 360,
        duration: 1000
      });
    } else {
      this.statusText.setText('GAME OVER');
      this.statusText.setColor('#ff0000');
      this.tweens.add({
        targets: this.player,
        alpha: 0,
        duration: 500
      });
    }

    // 更新最终信号
    window.__signals__.bossHealth = this.bossHealth;
    window.__signals__.playerHealth = this.playerHealth;
    window.__signals__.score = this.score;
    window.__signals__.gameOver = this.gameOver;
    window.__signals__.victory = this.victory;

    this.logEvent('gameEnd', {
      victory: victory,
      finalScore: this.score,
      bossHealth: this.bossHealth,
      playerHealth: this.playerHealth
    });

    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  logEvent(eventType, data) {
    const event = {
      time: this.time.now,
      type: eventType,
      data: data
    };
    window.__signals__.events.push(event);
    console.log('[GAME EVENT]', JSON.stringify(event));
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);