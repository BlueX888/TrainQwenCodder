class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.maxBossHealth = 8;
    this.gameOver = false;
    this.victory = false;
    this.playerSpeed = 200;
    this.bulletSpeed = 400;
    this.bossBulletSpeed = 300;
  }

  preload() {
    // 生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 30, 30);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();

    // 生成Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.fillStyle(0x000000, 1);
    bossGraphics.fillCircle(20, 25, 8);
    bossGraphics.fillCircle(60, 25, 8);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 生成玩家子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 生成Boss子弹纹理
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillCircle(8, 8, 8);
    bossBulletGraphics.generateTexture('bossBullet', 16, 16);
    bossBulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100);

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    this.bossBullets = this.physics.add.group({
      defaultKey: 'bossBullet',
      maxSize: 50
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // Boss攻击定时器（每1.5秒）
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

    // UI文本
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#fff'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 550, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Boss移动模式
    this.bossMovementTimer = this.time.addEvent({
      delay: 2000,
      callback: this.changeBossDirection,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    if (this.gameOver || this.victory) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }

    // 玩家射击（限制射击频率）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.playerShoot();
      this.lastFired = time;
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

    // Boss边界反弹
    if (this.boss.x <= 40 || this.boss.x >= 760) {
      this.boss.body.velocity.x *= -1;
    }
  }

  playerShoot() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-this.bulletSpeed);
    }
  }

  bossAttack() {
    if (this.gameOver || this.victory) {
      return;
    }

    // Boss发射3颗子弹（扇形攻击）
    const angles = [-30, 0, 30];
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        
        const radians = Phaser.Math.DegToRad(90 + angle);
        const velocityX = Math.cos(radians) * this.bossBulletSpeed;
        const velocityY = Math.sin(radians) * this.bossBulletSpeed;
        
        bullet.body.setVelocity(velocityX, velocityY);
      }
    });
  }

  changeBossDirection() {
    if (this.gameOver || this.victory) {
      return;
    }

    // 随机改变Boss移动方向
    const directions = [-100, -50, 50, 100];
    const newVelocity = Phaser.Math.RND.pick(directions);
    this.boss.body.setVelocityX(newVelocity);
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.bossHealth--;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.bossAttackTimer.destroy();
      this.bossMovementTimer.destroy();
      boss.setVisible(false);
      this.statusText.setText('VICTORY!');
      
      // 清理所有子弹
      this.bossBullets.clear(true, true);
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.gameOver = true;
    this.bossAttackTimer.destroy();
    this.bossMovementTimer.destroy();
    
    player.setTint(0xff0000);
    this.statusText.setText('GAME OVER!');
    
    // 停止所有移动
    player.body.setVelocity(0, 0);
    this.boss.body.setVelocity(0, 0);
    
    // 清理所有子弹
    this.bossBullets.clear(true, true);
    this.playerBullets.clear(true, true);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000033',
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