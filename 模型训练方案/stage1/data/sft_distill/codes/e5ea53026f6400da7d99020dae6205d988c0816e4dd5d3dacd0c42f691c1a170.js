class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.playerHealth = 3;
    this.gameOver = false;
    this.victory = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化signals记录
    window.__signals__ = {
      events: [],
      bossHealth: 8,
      playerHealth: 3,
      playerHits: 0,
      bossAttacks: 0,
      gameOver: false,
      victory: false
    };

    this.logSignal = (event, data) => {
      window.__signals__.events.push({
        time: this.time.now,
        event,
        ...data
      });
      console.log(JSON.stringify({ event, ...data }));
    };

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 64, 64);
    bossGraphics.generateTexture('boss', 64, 64);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('playerBullet', 8, 8);
    bulletGraphics.destroy();

    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillCircle(6, 6, 6);
    bossBulletGraphics.generateTexture('bossBullet', 12, 12);
    bossBulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);

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
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    this.canShoot = true;
    this.shootCooldown = 300;

    // Boss攻击定时器 - 每1秒攻击
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

    this.logSignal('game_start', {
      bossHealth: this.bossHealth,
      playerHealth: this.playerHealth
    });
  }

  update(time, delta) {
    if (this.gameOver || this.victory) {
      return;
    }

    // 玩家移动
    const speed = 250;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 玩家射击
    if (this.cursors.space.isDown && this.canShoot) {
      this.playerShoot();
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // 清理越界子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y > 600) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  playerShoot() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      this.logSignal('player_shoot', {
        x: this.player.x,
        y: this.player.y
      });
    }
  }

  bossAttack() {
    if (this.gameOver || this.victory) {
      return;
    }

    window.__signals__.bossAttacks++;

    // Boss发射多个子弹（扇形攻击模式）
    const angles = [-30, -15, 0, 15, 30];
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        
        const radians = Phaser.Math.DegToRad(angle);
        const velocityX = Math.sin(radians) * 200;
        const velocityY = Math.cos(radians) * 200;
        
        bullet.setVelocity(velocityX, velocityY);
      }
    });

    this.logSignal('boss_attack', {
      attackCount: window.__signals__.bossAttacks,
      bulletsCount: angles.length
    });
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.bossHealth--;
    window.__signals__.bossHealth = this.bossHealth;
    window.__signals__.playerHits++;

    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    this.logSignal('boss_hit', {
      remainingHealth: this.bossHealth,
      totalHits: window.__signals__.playerHits
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      window.__signals__.victory = true;
      window.__signals__.gameOver = true;
      this.endGame('VICTORY!');
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.playerHealth--;
    window.__signals__.playerHealth = this.playerHealth;

    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家受击闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    this.logSignal('player_hit', {
      remainingHealth: this.playerHealth
    });

    if (this.playerHealth <= 0) {
      this.gameOver = true;
      window.__signals__.gameOver = true;
      this.endGame('GAME OVER!');
    }
  }

  endGame(message) {
    this.statusText.setText(message);
    this.bossAttackTimer.destroy();
    
    // 停止所有物理对象
    this.player.setVelocity(0);
    this.boss.setVelocity(0);
    this.playerBullets.clear(true, true);
    this.bossBullets.clear(true, true);

    this.logSignal('game_end', {
      message,
      finalBossHealth: this.bossHealth,
      finalPlayerHealth: this.playerHealth,
      victory: this.victory
    });

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