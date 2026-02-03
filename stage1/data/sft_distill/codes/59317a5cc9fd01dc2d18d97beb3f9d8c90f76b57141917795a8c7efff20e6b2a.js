class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    
    // 可验证的状态信号
    this.playerHealth = 3;
    this.bossHealth = 10;
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(-40, -40, 80, 80);
    bossGraphics.fillStyle(0x000000, 1);
    bossGraphics.fillCircle(-15, -15, 8);
    bossGraphics.fillCircle(15, -15, 8);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建Boss攻击波纹理
    const attackGraphics = this.add.graphics();
    attackGraphics.fillStyle(0xff00ff, 1);
    attackGraphics.fillCircle(0, 0, 15);
    attackGraphics.generateTexture('bossAttack', 30, 30);
    attackGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100);

    // Boss左右移动逻辑
    this.bossDirection = 1;

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建Boss攻击组
    this.bossAttacks = this.physics.add.group({
      defaultKey: 'bossAttack',
      maxSize: 30
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 300;

    // Boss攻击定时器（每3秒）
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
      fill: '#ffff00'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
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
      this.shootBullet();
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // Boss左右移动
    if (this.boss.x >= 750 && this.bossDirection === 1) {
      this.bossDirection = -1;
      this.boss.setVelocityX(-100);
    } else if (this.boss.x <= 50 && this.bossDirection === -1) {
      this.bossDirection = 1;
      this.boss.setVelocityX(100);
    }

    // 清理超出屏幕的子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理超出屏幕的Boss攻击
    this.bossAttacks.children.entries.forEach(attack => {
      if (attack.active && attack.y > 610) {
        attack.setActive(false);
        attack.setVisible(false);
      }
    });
  }

  shootBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-400);
    }
  }

  bossAttack() {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // Boss发射3个攻击波（扇形）
    const angles = [-30, 0, 30];
    angles.forEach(angle => {
      const attack = this.bossAttacks.get(this.boss.x, this.boss.y + 40);
      if (attack) {
        attack.setActive(true);
        attack.setVisible(true);
        
        const radians = Phaser.Math.DegToRad(angle);
        const speed = 200;
        attack.body.setVelocity(
          Math.sin(radians) * speed,
          Math.cos(radians) * speed
        );
      }
    });
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);

    this.bossHealth--;
    this.score += 10;
    
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss闪烁效果
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
    this.boss.setVisible(false);
    this.bossAttackTimer.destroy();
    
    this.statusText.setText('YOU WIN!');
    this.statusText.setStyle({ fill: '#00ff00' });

    // 停止所有攻击
    this.bossAttacks.clear(true, true);
  }

  loseGame() {
    this.gameOver = true;
    this.player.setVisible(false);
    this.bossAttackTimer.destroy();
    
    this.statusText.setText('GAME OVER');
    this.statusText.setStyle({ fill: '#ff0000' });

    // 停止所有攻击
    this.bossAttacks.clear(true, true);
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