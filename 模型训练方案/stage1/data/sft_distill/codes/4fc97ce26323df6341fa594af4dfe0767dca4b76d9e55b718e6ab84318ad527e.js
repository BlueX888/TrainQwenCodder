class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    // 可验证的状态信号
    this.bossHealth = 20;
    this.playerHealth = 5;
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理（绿色三角形）
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

    // Boss 纹理（红色方块）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 玩家子弹纹理（蓝色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x00ffff, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // Boss 攻击纹理（橙色大圆）
    const attackGraphics = this.add.graphics();
    attackGraphics.fillStyle(0xff6600, 1);
    attackGraphics.fillCircle(8, 8, 8);
    attackGraphics.generateTexture('bossAttack', 16, 16);
    attackGraphics.destroy();
  }

  create() {
    // 重置状态
    this.bossHealth = 20;
    this.playerHealth = 5;
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setVelocityX(100);

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建 Boss 攻击组
    this.bossAttacks = this.physics.add.group({
      defaultKey: 'bossAttack',
      maxSize: 30
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

    // Boss 攻击定时器（每 3 秒）
    this.bossAttackTimer = this.time.addEvent({
      delay: 3000,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // Boss 移动模式
    this.bossDirection = 1;

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
      fill: '#ff0000'
    });

    this.playerHealthText = this.add.text(16, 46, `Player HP: ${this.playerHealth}`, {
      fontSize: '20px',
      fill: '#00ff00'
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
    if (this.gameOver) {
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
      this.shootBullet();
    }

    // Boss 移动逻辑（左右移动）
    if (this.boss.x <= 40) {
      this.boss.setVelocityX(100);
    } else if (this.boss.x >= 760) {
      this.boss.setVelocityX(-100);
    }

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

  shootBullet() {
    this.canShoot = false;
    
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }

    this.time.delayedCall(this.shootCooldown, () => {
      this.canShoot = true;
    });
  }

  bossAttack() {
    if (this.gameOver) {
      return;
    }

    // Boss 发射多个攻击弹幕（扇形）
    const attackCount = 5;
    const angleStep = 30;
    const baseAngle = 90;

    for (let i = 0; i < attackCount; i++) {
      const angle = baseAngle + (i - Math.floor(attackCount / 2)) * angleStep;
      const attack = this.bossAttacks.get(this.boss.x, this.boss.y + 40);
      
      if (attack) {
        attack.setActive(true);
        attack.setVisible(true);
        
        const rad = Phaser.Math.DegToRad(angle);
        const speed = 200;
        attack.setVelocity(
          Math.cos(rad) * speed,
          Math.sin(rad) * speed
        );
      }
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.bossHealth--;
    this.score += 10;
    
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss 受击闪烁
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true
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

    // 玩家受击闪烁
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true
    });

    if (this.playerHealth <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.bossAttackTimer.destroy();
    
    this.boss.setVelocity(0);
    this.player.setVelocity(0);
    
    this.statusText.setText('YOU WIN!');
    
    // 清理所有攻击
    this.bossAttacks.clear(true, true);
    
    console.log('Game Won! Final Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.bossAttackTimer.destroy();
    
    this.boss.setVelocity(0);
    this.player.setVelocity(0);
    
    this.statusText.setText('GAME OVER');
    
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

const game = new Phaser.Game(config);