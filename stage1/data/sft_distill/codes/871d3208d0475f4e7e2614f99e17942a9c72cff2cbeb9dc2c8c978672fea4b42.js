// Boss战游戏 - 完整可运行代码
class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
    this.bossHealth = 20;
    this.playerHealth = 5;
    this.score = 0;
    this.gameOver = false;
    this.signals = [];
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
    this.createTextures();
  }

  create() {
    // 初始化signals
    window.__signals__ = this.signals;
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(30, 30);
    
    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setSize(80, 80);
    this.boss.body.setImmovable(true);
    
    // Boss移动模式
    this.bossDirection = 1;
    
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
    
    // 记录初始状态
    this.logSignal('GAME_START', {
      bossHealth: this.bossHealth,
      playerHealth: this.playerHealth,
      score: this.score
    });
  }

  createTextures() {
    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(15, 0, 0, 30, 30, 30);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建Boss纹理（红色大方块）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.lineStyle(4, 0x880000);
    bossGraphics.strokeRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();
    
    // 创建玩家子弹纹理（黄色小圆）
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0xffff00, 1);
    playerBulletGraphics.fillCircle(4, 4, 4);
    playerBulletGraphics.generateTexture('playerBullet', 8, 8);
    playerBulletGraphics.destroy();
    
    // 创建Boss子弹纹理（红色圆）
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff3333, 1);
    bossBulletGraphics.fillCircle(6, 6, 6);
    bossBulletGraphics.generateTexture('bossBullet', 12, 12);
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
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }
    
    // 玩家射击（每200ms一次）
    if (this.spaceKey.isDown && time > this.lastFireTime + 200) {
      this.playerShoot();
      this.lastFireTime = time;
    }
    
    // Boss左右移动
    this.boss.x += this.bossDirection * 2;
    if (this.boss.x > 700 || this.boss.x < 100) {
      this.bossDirection *= -1;
    }
    
    // 清理越界子弹
    this.playerBullets.children.each((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
    
    this.bossBullets.children.each((bullet) => {
      if (bullet.active && bullet.y > 610) {
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
      
      this.logSignal('PLAYER_SHOOT', {
        x: this.player.x,
        y: this.player.y,
        time: this.time.now
      });
    }
  }

  bossAttack() {
    if (this.gameOver) return;
    
    // Boss攻击模式：发射3颗子弹（扇形）
    const angles = [-20, 0, 20];
    angles.forEach((angle) => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        
        const rad = Phaser.Math.DegToRad(90 + angle);
        const speed = 250;
        bullet.body.velocity.x = Math.cos(rad) * speed;
        bullet.body.velocity.y = Math.sin(rad) * speed;
      }
    });
    
    this.logSignal('BOSS_ATTACK', {
      bossX: this.boss.x,
      bossY: this.boss.y,
      bulletCount: 3,
      time: this.time.now
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
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    this.logSignal('BOSS_HIT', {
      bossHealth: this.bossHealth,
      score: this.score,
      time: this.time.now
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
    
    // 玩家受击闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
    
    this.logSignal('PLAYER_HIT', {
      playerHealth: this.playerHealth,
      time: this.time.now
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
    
    this.logSignal('GAME_VICTORY', {
      finalScore: this.score,
      playerHealth: this.playerHealth,
      time: this.time.now
    });
    
    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  defeat() {
    this.gameOver = true;
    this.bossAttackTimer.remove();
    this.player.setVisible(false);
    this.statusText.setText('DEFEAT!');
    
    this.logSignal('GAME_DEFEAT', {
      finalScore: this.score,
      bossHealth: this.bossHealth,
      time: this.time.now
    });
    
    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  logSignal(type, data) {
    const signal = {
      type,
      timestamp: Date.now(),
      gameTime: this.time ? this.time.now : 0,
      ...data
    };
    this.signals.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
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
  scene: BossScene
};

// 启动游戏
new Phaser.Game(config);