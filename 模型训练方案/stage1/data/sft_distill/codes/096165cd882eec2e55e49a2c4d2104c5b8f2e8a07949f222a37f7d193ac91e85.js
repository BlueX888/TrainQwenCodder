// Boss战游戏 - 完整可运行代码
class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
    this.bossHealth = 8;
    this.playerHealth = 3;
    this.score = 0;
    this.gameOver = false;
    this.signals = [];
  }

  preload() {
    // 使用Graphics创建纹理，不依赖外部资源
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 100, 80);
    bossGraphics.generateTexture('boss', 100, 80);
    bossGraphics.destroy();

    // 玩家子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('playerBullet', 10, 10);
    bulletGraphics.destroy();

    // Boss子弹纹理
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillCircle(6, 6, 6);
    bossBulletGraphics.generateTexture('bossBullet', 12, 12);
    bossBulletGraphics.destroy();
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      bossHealth: this.bossHealth,
      playerHealth: this.playerHealth,
      score: this.score,
      gameOver: this.gameOver,
      events: []
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setSize(100, 80);
    
    // Boss左右移动
    this.tweens.add({
      targets: this.boss,
      x: 600,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

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

    // Boss攻击定时器 - 每1秒发射攻击
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
      fill: '#ff0000',
      fontStyle: 'bold'
    });

    this.playerHealthText = this.add.text(16, 50, `Player HP: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#00aaff',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 84, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffff00'
    });

    this.instructionText = this.add.text(400, 550, 'WASD: Move | SPACE: Shoot', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.logEvent('game_start', { bossHealth: this.bossHealth });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    const speed = 300;
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
      bullet.body.setVelocityY(-500);
      this.logEvent('player_shoot', { x: this.player.x, y: this.player.y });
    }
  }

  bossAttack() {
    if (this.gameOver) {
      return;
    }

    // Boss发射3个扇形子弹
    const angles = [-30, 0, 30];
    const speed = 250;

    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        
        const rad = Phaser.Math.DegToRad(90 + angle);
        const vx = Math.cos(rad) * speed;
        const vy = Math.sin(rad) * speed;
        
        bullet.body.setVelocity(vx, vy);
      }
    });

    this.logEvent('boss_attack', { 
      bossX: this.boss.x, 
      bossY: this.boss.y,
      bulletCount: 3 
    });
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.bossHealth--;
    this.score += 100;
    
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    this.logEvent('boss_hit', { 
      remainingHealth: this.bossHealth,
      score: this.score 
    });

    if (this.bossHealth <= 0) {
      this.victory();
    }

    this.updateSignals();
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

    this.logEvent('player_hit', { 
      remainingHealth: this.playerHealth 
    });

    if (this.playerHealth <= 0) {
      this.defeat();
    }

    this.updateSignals();
  }

  victory() {
    this.gameOver = true;
    this.bossAttackTimer.destroy();
    
    this.boss.setTint(0x888888);
    this.tweens.killTweensOf(this.boss);
    
    const victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: victoryText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.logEvent('game_end', { 
      result: 'victory',
      finalScore: this.score 
    });
    this.updateSignals();
  }

  defeat() {
    this.gameOver = true;
    this.bossAttackTimer.destroy();
    
    this.player.setTint(0x888888);
    
    const defeatText = this.add.text(400, 300, 'DEFEAT!', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: defeatText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.logEvent('game_end', { 
      result: 'defeat',
      finalScore: this.score 
    });
    this.updateSignals();
  }

  logEvent(eventType, data) {
    const event = {
      timestamp: this.time.now,
      type: eventType,
      ...data
    };
    this.signals.push(event);
    console.log('[SIGNAL]', JSON.stringify(event));
  }

  updateSignals() {
    window.__signals__ = {
      bossHealth: this.bossHealth,
      playerHealth: this.playerHealth,
      score: this.score,
      gameOver: this.gameOver,
      events: this.signals
    };
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BossScene
};

// 启动游戏
new Phaser.Game(config);