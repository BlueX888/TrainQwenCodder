class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 3;
    this.playerHealth = 1;
    this.gameOver = false;
    this.victory = false;
    this.score = 0;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理 (绿色三角形)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Boss纹理 (红色大方块)
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.fillStyle(0x000000, 1);
    bossGraphics.fillRect(20, 30, 15, 15);
    bossGraphics.fillRect(45, 30, 15, 15);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 玩家子弹纹理 (蓝色小圆)
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x00ffff, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('playerBullet', 8, 8);
    bulletGraphics.destroy();

    // Boss攻击纹理 (橙色圆形)
    const bossAttackGraphics = this.add.graphics();
    bossAttackGraphics.fillStyle(0xff6600, 1);
    bossAttackGraphics.fillCircle(8, 8, 8);
    bossAttackGraphics.generateTexture('bossAttack', 16, 16);
    bossAttackGraphics.destroy();
  }

  create() {
    // 重置状态
    this.bossHealth = 3;
    this.playerHealth = 1;
    this.gameOver = false;
    this.victory = false;
    this.score = 0;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setImmovable(true);

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
    
    // 玩家射击冷却
    this.lastFired = 0;
    this.fireRate = 200;

    // Boss攻击定时器 (每1.5秒)
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

    // UI文本
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#fff',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 控制提示
    this.add.text(400, 580, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '16px',
      fill: '#aaa'
    }).setOrigin(0.5);
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

    // 玩家射击
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.playerShoot();
      this.lastFired = time;
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

  playerShoot() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -400;
    }
  }

  bossAttack() {
    if (this.gameOver || this.victory) {
      return;
    }

    // Boss发射3个攻击弹幕，呈扇形
    const angles = [-30, 0, 30];
    angles.forEach(angle => {
      const attack = this.bossAttacks.get(this.boss.x, this.boss.y + 40);
      if (attack) {
        attack.setActive(true);
        attack.setVisible(true);
        
        const rad = Phaser.Math.DegToRad(angle + 90);
        const speed = 250;
        attack.body.velocity.x = Math.cos(rad) * speed;
        attack.body.velocity.y = Math.sin(rad) * speed;
      }
    });
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();

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
      repeat: 2
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.bossAttackTimer.remove();
      boss.setVisible(false);
      this.bossAttacks.clear(true, true);
      
      this.statusText.setText('VICTORY!');
      this.statusText.setColor('#00ff00');
      
      this.time.delayedCall(2000, () => {
        this.scene.restart();
      });
    }
  }

  hitPlayer(player, attack) {
    if (this.gameOver) return;

    attack.setActive(false);
    attack.setVisible(false);

    this.playerHealth = 0;
    this.gameOver = true;
    
    this.bossAttackTimer.remove();
    
    player.setTint(0xff0000);
    player.setVelocity(0, 0);
    
    this.statusText.setText('GAME OVER');
    this.statusText.setColor('#ff0000');

    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
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

new Phaser.Game(config);