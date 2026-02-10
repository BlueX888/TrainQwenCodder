class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    
    // 可验证的状态信号
    this.bossHealth = 20;
    this.maxBossHealth = 20;
    this.playerHealth = 3;
    this.score = 0;
    this.gameOver = false;
    this.victory = false;
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
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.fillStyle(0x000000, 1);
    bossGraphics.fillCircle(20, 25, 8);
    bossGraphics.fillCircle(60, 25, 8);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建玩家子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('playerBullet', 8, 8);
    bulletGraphics.destroy();

    // 创建 Boss 攻击纹理
    const bossAttackGraphics = this.add.graphics();
    bossAttackGraphics.fillStyle(0xff00ff, 1);
    bossAttackGraphics.fillCircle(6, 6, 6);
    bossAttackGraphics.generateTexture('bossAttack', 12, 12);
    bossAttackGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocity(100, 0);

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 20
    });

    this.bossAttacks = this.physics.add.group({
      defaultKey: 'bossAttack',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 300;

    // Boss 攻击定时器 - 每 3 秒发射攻击
    this.bossAttackTimer = this.time.addEvent({
      delay: 3000,
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
      this.player,
      this.bossAttacks,
      this.hitPlayer,
      null,
      this
    );

    // UI 文本
    this.bossHealthText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#fff'
    });

    this.playerHealthText = this.add.text(16, 45, '', {
      fontSize: '18px',
      fill: '#0f0'
    });

    this.scoreText = this.add.text(16, 70, '', {
      fontSize: '18px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#fff',
      align: 'center'
    }).setOrigin(0.5);

    // Boss 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x666666, 1);
    this.healthBarBg.fillRect(250, 50, 300, 20);

    // Boss 血量条
    this.healthBar = this.add.graphics();

    this.updateUI();
  }

  update(time, delta) {
    if (this.gameOver || this.victory) {
      return;
    }

    // 玩家移动
    const speed = 250;
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
    if (this.wasd.space.isDown && this.canShoot) {
      this.shootPlayerBullet();
    }

    // Boss 移动模式（左右摇摆）
    if (this.boss.x <= 100) {
      this.boss.body.setVelocityX(100);
    } else if (this.boss.x >= 700) {
      this.boss.body.setVelocityX(-100);
    }

    // 清理超出屏幕的子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false).setVisible(false);
      }
    });

    this.bossAttacks.children.entries.forEach(attack => {
      if (attack.active && (attack.y > 610 || attack.x < -10 || attack.x > 810)) {
        attack.setActive(false).setVisible(false);
      }
    });
  }

  shootPlayerBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true).setVisible(true);
      bullet.body.setVelocity(0, -400);
      this.canShoot = false;

      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
  }

  bossAttack() {
    if (this.gameOver || this.victory) {
      return;
    }

    // 发射多个弹幕（扇形攻击）
    const numBullets = 8;
    const angleStep = 180 / (numBullets - 1);
    const baseAngle = -90;

    for (let i = 0; i < numBullets; i++) {
      const attack = this.bossAttacks.get(this.boss.x, this.boss.y + 40);
      
      if (attack) {
        const angle = Phaser.Math.DegToRad(baseAngle + angleStep * i);
        const speed = 200;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        attack.setActive(true).setVisible(true);
        attack.body.setVelocity(vx, vy);
      }
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false).setVisible(false);
    this.bossHealth--;
    this.score += 100;

    // Boss 受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    this.updateUI();

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.bossAttackTimer.remove();
      boss.setVelocity(0, 0);
      
      this.statusText.setText('VICTORY!\nScore: ' + this.score);
      
      // Boss 爆炸效果
      this.tweens.add({
        targets: boss,
        alpha: 0,
        scale: 2,
        duration: 500,
        onComplete: () => {
          boss.destroy();
        }
      });
    }
  }

  hitPlayer(player, attack) {
    attack.setActive(false).setVisible(false);
    this.playerHealth--;

    // 玩家受击闪烁
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    this.updateUI();

    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.bossAttackTimer.remove();
      player.setVelocity(0, 0);
      this.statusText.setText('GAME OVER\nScore: ' + this.score);
      
      this.tweens.add({
        targets: player,
        alpha: 0,
        duration: 500
      });
    }
  }

  updateUI() {
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // 更新血量条
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 300 * healthPercent;
    
    let color = 0x00ff00;
    if (healthPercent < 0.3) {
      color = 0xff0000;
    } else if (healthPercent < 0.6) {
      color = 0xffff00;
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(250, 50, barWidth, 20);
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

const game = new Phaser.Game(config);