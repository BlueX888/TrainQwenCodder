class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 5;
    this.playerHealth = 3;
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
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
    this.boss.setImmovable(true);

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 20
    });

    // 创建 Boss 攻击组
    this.bossAttacks = this.physics.add.group({
      defaultKey: 'bossAttack',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 300;

    // Boss 攻击定时器
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
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
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
    if (this.spaceKey.isDown && this.canShoot) {
      this.shootPlayerBullet();
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // Boss 左右移动
    if (!this.gameOver && !this.gameWon) {
      const bossSpeed = 100;
      const bossX = this.boss.x;
      if (bossX <= 100) {
        this.boss.setVelocityX(bossSpeed);
      } else if (bossX >= 700) {
        this.boss.setVelocityX(-bossSpeed);
      }
      if (this.boss.body.velocity.x === 0) {
        this.boss.setVelocityX(bossSpeed);
      }
    }

    // 清理超出边界的子弹
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
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  bossAttack() {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // Boss 发射 3 个攻击波，呈扇形
    const angles = [-30, 0, 30];
    angles.forEach(angle => {
      const attack = this.bossAttacks.get(this.boss.x, this.boss.y + 40);
      if (attack) {
        attack.setActive(true);
        attack.setVisible(true);
        
        const speed = 200;
        const rad = Phaser.Math.DegToRad(angle);
        const vx = Math.sin(rad) * speed;
        const vy = Math.cos(rad) * speed;
        
        attack.setVelocity(vx, vy);
      }
    });
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.bossHealth--;
    this.score += 100;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss 闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.bossHealth <= 0) {
      this.winGame();
    }
  }

  hitPlayer(player, attack) {
    attack.setActive(false);
    attack.setVisible(false);
    
    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.playerHealth <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameWon = true;
    this.boss.setVelocity(0, 0);
    this.bossAttackTimer.remove();
    
    // 销毁所有攻击
    this.bossAttacks.clear(true, true);
    
    this.statusText.setText('YOU WIN!');
    
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

    console.log('Game Won! Final Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.player.setVelocity(0, 0);
    this.bossAttackTimer.remove();
    
    this.statusText.setText('GAME OVER');
    
    // 玩家消失效果
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      duration: 500
    });

    console.log('Game Over! Final Score:', this.score);
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