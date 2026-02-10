class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 3;
    this.gameOver = false;
    this.victory = false;
    this.score = 0;
    this.playerAlive = true;
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
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('playerBullet', 8, 8);
    bulletGraphics.destroy();

    // 创建 Boss 攻击纹理
    const attackGraphics = this.add.graphics();
    attackGraphics.fillStyle(0xff00ff, 1);
    attackGraphics.fillCircle(6, 6, 6);
    attackGraphics.generateTexture('bossAttack', 12, 12);
    attackGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.health = this.bossHealth;

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 20
    });

    this.bossAttacks = this.physics.add.group({
      defaultKey: 'bossAttack',
      maxSize: 50
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 200;

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
      this.player,
      this.bossAttacks,
      this.hitPlayer,
      null,
      this
    );

    // UI 文本
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.boss.health}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Boss 移动模式
    this.bossMoveTimer = 0;
    this.bossMoveDirection = 1;
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

    // 玩家射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shootPlayerBullet();
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // Boss 移动（左右摆动）
    this.bossMoveTimer += delta;
    if (this.bossMoveTimer > 2000) {
      this.bossMoveTimer = 0;
      this.bossMoveDirection *= -1;
    }
    this.boss.setVelocityX(this.bossMoveDirection * 150);

    // 清理超出屏幕的子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossAttacks.children.entries.forEach(attack => {
      if (attack.active && attack.y > 610) {
        attack.setActive(false);
        attack.setVisible(false);
      }
    });
  }

  shootPlayerBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y);
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

    // 发射 3 个攻击弹幕（扇形）
    const angles = [-30, 0, 30];
    angles.forEach(angle => {
      const attack = this.bossAttacks.get(this.boss.x, this.boss.y);
      if (attack) {
        attack.setActive(true);
        attack.setVisible(true);
        
        const angleRad = Phaser.Math.DegToRad(angle + 90);
        const speed = 200;
        attack.setVelocity(
          Math.cos(angleRad) * speed,
          Math.sin(angleRad) * speed
        );
      }
    });
  }

  hitBoss(bullet, boss) {
    // 子弹消失
    bullet.setActive(false);
    bullet.setVisible(false);

    // Boss 扣血
    boss.health -= 1;
    this.score += 100;
    this.bossHealthText.setText(`Boss HP: ${boss.health}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss 闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    // Boss 被击败
    if (boss.health <= 0) {
      this.victory = true;
      this.gameOver = true;
      this.endGame('VICTORY!');
    }
  }

  hitPlayer(player, attack) {
    if (!this.playerAlive) {
      return;
    }

    // 攻击消失
    attack.setActive(false);
    attack.setVisible(false);

    // 玩家死亡
    this.playerAlive = false;
    this.gameOver = true;
    this.endGame('GAME OVER!');
  }

  endGame(message) {
    // 停止 Boss 攻击
    this.bossAttackTimer.destroy();

    // 停止所有移动
    this.player.setVelocity(0, 0);
    this.boss.setVelocity(0, 0);

    // 清理所有子弹
    this.playerBullets.clear(true, true);
    this.bossAttacks.clear(true, true);

    // 显示结果
    this.statusText.setText(message);

    // 玩家闪烁效果
    if (!this.victory) {
      this.tweens.add({
        targets: this.player,
        alpha: 0,
        duration: 200,
        yoyo: true,
        repeat: 3
      });
    }

    // 重启提示
    this.time.delayedCall(2000, () => {
      this.add.text(400, 400, 'Press R to Restart', {
        fontSize: '24px',
        fill: '#fff'
      }).setOrigin(0.5);

      this.input.keyboard.once('keydown-R', () => {
        this.scene.restart();
        this.bossHealth = 3;
        this.gameOver = false;
        this.victory = false;
        this.score = 0;
        this.playerAlive = true;
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