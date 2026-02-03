class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.playerHealth = 3;
    this.bossHealth = 10;
    this.score = 0;
    this.gameOver = false;
    this.won = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建 Boss 纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(-40, -40, 80, 80);
    bossGraphics.fillStyle(0x880000, 1);
    bossGraphics.fillCircle(0, 0, 30);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 5);
    bulletGraphics.generateTexture('playerBullet', 10, 10);
    bulletGraphics.destroy();

    // 创建 Boss 攻击纹理
    const attackGraphics = this.add.graphics();
    attackGraphics.fillStyle(0xff00ff, 1);
    attackGraphics.fillCircle(0, 0, 8);
    attackGraphics.generateTexture('bossAttack', 16, 16);
    attackGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setImmovable(true);

    // Boss 移动模式（左右移动）
    this.tweens.add({
      targets: this.boss,
      x: 200,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

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
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 玩家射击冷却
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
    this.statusText.setVisible(false);

    // 提示文本
    this.add.text(400, 550, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '16px',
      fill: '#cccccc'
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
    if (this.spaceKey.isDown && this.canShoot) {
      this.shootPlayerBullet();
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // 清理超出边界的子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossAttacks.children.entries.forEach(attack => {
      if (attack.active && attack.y > 620) {
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
      bullet.body.setVelocityY(-400);
    }
  }

  bossAttack() {
    if (this.gameOver) {
      return;
    }

    // Boss 攻击模式：发射 5 个扇形弹幕
    const angleStep = 30;
    const startAngle = -60;
    
    for (let i = 0; i < 5; i++) {
      const angle = startAngle + (i * angleStep);
      const attack = this.bossAttacks.get(this.boss.x, this.boss.y + 40);
      
      if (attack) {
        attack.setActive(true);
        attack.setVisible(true);
        
        const radian = Phaser.Math.DegToRad(angle);
        const speed = 200;
        attack.body.setVelocity(
          Math.sin(radian) * speed,
          Math.cos(radian) * speed
        );
      }
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();

    this.bossHealth--;
    this.score += 100;
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

    if (this.bossHealth <= 0) {
      this.winGame();
    }
  }

  hitPlayer(player, attack) {
    attack.setActive(false);
    attack.setVisible(false);
    attack.body.stop();

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

    if (this.playerHealth <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.won = true;
    this.bossAttackTimer.destroy();
    
    this.boss.setVisible(false);
    this.statusText.setText('VICTORY!');
    this.statusText.setFill('#00ff00');
    this.statusText.setVisible(true);

    // 停止所有攻击
    this.bossAttacks.clear(true, true);
  }

  loseGame() {
    this.gameOver = true;
    this.won = false;
    this.bossAttackTimer.destroy();
    
    this.player.setVisible(false);
    this.statusText.setText('GAME OVER');
    this.statusText.setFill('#ff0000');
    this.statusText.setVisible(true);

    // 停止所有移动
    this.player.body.stop();
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