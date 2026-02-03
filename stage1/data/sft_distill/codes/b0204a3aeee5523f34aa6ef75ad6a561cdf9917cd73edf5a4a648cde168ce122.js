class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 20;
    this.playerHealth = 5;
    this.score = 0;
    this.gameOver = false;
    this.bossAttackTimer = null;
    this.lastPlayerShot = 0;
    this.playerShootCooldown = 300; // 毫秒
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 Boss 纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 64, 64);
    bossGraphics.generateTexture('boss', 64, 64);
    bossGraphics.destroy();

    // 创建玩家子弹纹理
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0xffff00, 1);
    playerBulletGraphics.fillCircle(4, 4, 4);
    playerBulletGraphics.generateTexture('playerBullet', 8, 8);
    playerBulletGraphics.destroy();

    // 创建 Boss 子弹纹理
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillCircle(6, 6, 6);
    bossBulletGraphics.generateTexture('bossBullet', 12, 12);
    bossBulletGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      bossHealth: this.bossHealth,
      playerHealth: this.playerHealth,
      score: this.score,
      gameOver: false,
      winner: null,
      events: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100);

    // 创建子弹组
    this.playerBullets = this.physics.add.group();
    this.bossBullets = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Boss 攻击模式 - 每秒发射子弹
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

    // UI 文本
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    this.playerHealthText = this.add.text(16, 46, `Player HP: ${this.playerHealth}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    this.scoreText = this.add.text(16, 76, `Score: ${this.score}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Boss 移动模式
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (!this.gameOver && this.boss.active) {
          this.boss.body.setVelocityX(-this.boss.body.velocity.x);
        }
      },
      loop: true
    });

    this.logEvent('GAME_START', { bossHealth: this.bossHealth, playerHealth: this.playerHealth });
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

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 玩家射击
    if (this.spaceKey.isDown && time > this.lastPlayerShot + this.playerShootCooldown) {
      this.playerShoot();
      this.lastPlayerShot = time;
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
    this.logEvent('PLAYER_SHOOT', { x: this.player.x, y: this.player.y });
  }

  bossAttack() {
    if (this.gameOver || !this.boss.active) return;

    // Boss 发射 3 颗子弹（扇形攻击）
    const angles = [-30, 0, 30];
    angles.forEach(angle => {
      const bullet = this.bossBullets.create(this.boss.x, this.boss.y + 40, 'bossBullet');
      const rad = Phaser.Math.DegToRad(angle);
      const speed = 200;
      bullet.setVelocity(Math.sin(rad) * speed, Math.cos(rad) * speed);
    });

    this.logEvent('BOSS_ATTACK', { 
      bossX: this.boss.x, 
      bossY: this.boss.y,
      bulletCount: 3 
    });
  }

  hitBoss(bullet, boss) {
    bullet.destroy();
    this.bossHealth--;
    this.score += 10;
    
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss 受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    this.logEvent('BOSS_HIT', { 
      bossHealth: this.bossHealth, 
      score: this.score 
    });

    if (this.bossHealth <= 0) {
      this.endGame(true);
    }

    this.updateSignals();
  }

  hitPlayer(bullet, player) {
    bullet.destroy();
    this.playerHealth--;
    
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家受击闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    this.logEvent('PLAYER_HIT', { playerHealth: this.playerHealth });

    if (this.playerHealth <= 0) {
      this.endGame(false);
    }

    this.updateSignals();
  }

  endGame(playerWon) {
    this.gameOver = true;
    
    if (this.bossAttackTimer) {
      this.bossAttackTimer.destroy();
    }

    // 停止所有子弹
    this.playerBullets.clear(true, true);
    this.bossBullets.clear(true, true);

    if (playerWon) {
      this.statusText.setText('YOU WIN!');
      this.statusText.setColor('#00ff00');
      this.boss.destroy();
      this.logEvent('GAME_END', { winner: 'PLAYER', finalScore: this.score });
    } else {
      this.statusText.setText('GAME OVER');
      this.statusText.setColor('#ff0000');
      this.player.destroy();
      this.logEvent('GAME_END', { winner: 'BOSS', finalScore: this.score });
    }

    window.__signals__.gameOver = true;
    window.__signals__.winner = playerWon ? 'PLAYER' : 'BOSS';
    this.updateSignals();

    // 3 秒后重启
    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.scene.restart();
      }
    });
  }

  logEvent(eventType, data) {
    const event = {
      time: this.time.now,
      type: eventType,
      data: data
    };
    window.__signals__.events.push(event);
    console.log(JSON.stringify(event));
  }

  updateSignals() {
    window.__signals__.bossHealth = this.bossHealth;
    window.__signals__.playerHealth = this.playerHealth;
    window.__signals__.score = this.score;
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