class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    
    // 可验证的状态信号
    this.playerHealth = 3;
    this.bossHealth = 20;
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

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建玩家子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('playerBullet', 8, 8);
    bulletGraphics.destroy();

    // 创建Boss子弹纹理
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff00ff, 1);
    bossBulletGraphics.fillCircle(6, 6, 6);
    bossBulletGraphics.generateTexture('bossBullet', 12, 12);
    bossBulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setVelocityX(100); // Boss左右移动

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
    
    // 玩家射击冷却
    this.lastShootTime = 0;
    this.shootCooldown = 300; // 毫秒

    // Boss攻击定时器 - 每2.5秒发射攻击
    this.bossAttackTimer = this.time.addEvent({
      delay: 2500,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // Boss移动模式
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (!this.gameOver && this.boss && this.boss.active) {
          this.boss.setVelocityX(-this.boss.body.velocity.x);
        }
      },
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
    this.playerHealthText = this.add.text(16, 16, `Player HP: ${this.playerHealth}`, {
      fontSize: '20px',
      fill: '#00ff00'
    });

    this.bossHealthText = this.add.text(16, 46, `Boss HP: ${this.bossHealth}`, {
      fontSize: '20px',
      fill: '#ff0000'
    });

    this.scoreText = this.add.text(16, 76, `Score: ${this.score}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 游戏提示
    this.add.text(400, 580, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '16px',
      fill: '#888888'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
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

    // 玩家射击
    if (this.spaceKey.isDown && time > this.lastShootTime + this.shootCooldown) {
      this.shootPlayerBullet();
      this.lastShootTime = time;
    }

    // 清理离开屏幕的子弹
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

  shootPlayerBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  bossAttack() {
    if (this.gameOver || !this.boss || !this.boss.active) {
      return;
    }

    // Boss攻击模式：发射多个子弹
    const patterns = [
      this.bossAttackPattern1,
      this.bossAttackPattern2,
      this.bossAttackPattern3
    ];
    
    // 随机选择攻击模式
    const pattern = Phaser.Math.RND.pick(patterns);
    pattern.call(this);
  }

  // 攻击模式1：直线下落
  bossAttackPattern1() {
    for (let i = -2; i <= 2; i++) {
      const bullet = this.bossBullets.get(this.boss.x + i * 40, this.boss.y + 50);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(200);
      }
    }
  }

  // 攻击模式2：扇形发射
  bossAttackPattern2() {
    const angles = [-60, -30, 0, 30, 60];
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 50);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const rad = Phaser.Math.DegToRad(angle + 90);
        const speed = 250;
        bullet.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
      }
    });
  }

  // 攻击模式3：追踪玩家
  bossAttackPattern3() {
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 200, () => {
        if (this.gameOver || !this.player || !this.player.active) {
          return;
        }
        const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 50);
        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          
          // 计算朝向玩家的方向
          const angle = Phaser.Math.Angle.Between(
            this.boss.x, this.boss.y,
            this.player.x, this.player.y
          );
          const speed = 200;
          bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
      });
    }
  }

  hitBoss(bullet, boss) {
    bullet.destroy();
    this.bossHealth--;
    this.score += 10;
    
    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });

    this.updateUI();

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.endGame('VICTORY!', '#00ff00');
    }
  }

  hitPlayer(bullet, player) {
    bullet.destroy();
    this.playerHealth--;
    
    // 玩家受击闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    this.updateUI();

    if (this.playerHealth <= 0) {
      this.victory = false;
      this.endGame('GAME OVER', '#ff0000');
    }
  }

  updateUI() {
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  endGame(message, color) {
    this.gameOver = true;
    
    // 停止Boss攻击
    if (this.bossAttackTimer) {
      this.bossAttackTimer.destroy();
    }

    // 销毁所有子弹
    this.playerBullets.clear(true, true);
    this.bossBullets.clear(true, true);

    // 停止Boss
    if (this.boss && this.boss.active) {
      this.boss.setVelocity(0, 0);
    }

    // 停止玩家
    if (this.player && this.player.active) {
      this.player.setVelocity(0, 0);
    }

    // 显示结果
    this.statusText.setText(message);
    this.statusText.setColor(color);

    // 重启提示
    this.time.delayedCall(2000, () => {
      this.add.text(400, 360, 'Click to Restart', {
        fontSize: '24px',
        fill: '#ffffff'
      }).setOrigin(0.5);

      this.input.once('pointerdown', () => {
        this.scene.restart();
      });
    });

    // 输出最终状态到控制台
    console.log('Game Over!');
    console.log(`Victory: ${this.victory}`);
    console.log(`Final Score: ${this.score}`);
    console.log(`Player Health: ${this.playerHealth}`);
    console.log(`Boss Health: ${this.bossHealth}`);
  }
}

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
  scene: BossBattleScene
};

const game = new Phaser.Game(config);