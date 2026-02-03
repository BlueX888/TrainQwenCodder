class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.playerHealth = 3;
    this.score = 0;
    this.gameOver = false;
    this.bossAttackTimer = null;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建 Boss 纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(-40, -40, 80, 80);
    bossGraphics.fillStyle(0x000000, 1);
    bossGraphics.fillCircle(-20, -15, 8);
    bossGraphics.fillCircle(20, -15, 8);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 5);
    bulletGraphics.generateTexture('playerBullet', 10, 10);
    bulletGraphics.destroy();

    // 创建 Boss 攻击纹理
    const bossAttackGraphics = this.add.graphics();
    bossAttackGraphics.fillStyle(0xff00ff, 1);
    bossAttackGraphics.fillCircle(0, 0, 8);
    bossAttackGraphics.generateTexture('bossAttack', 16, 16);
    bossAttackGraphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x001122, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100);

    // Boss 左右移动逻辑
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this.boss) {
        this.boss.body.setVelocityX(-this.boss.body.velocity.x);
      }
    });
    this.boss.body.setCollideWorldBounds(true);
    this.boss.body.onWorldBounds = true;

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
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(
      this.playerBullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    this.physics.add.overlap(
      this.bossAttacks,
      this.player,
      this.hitPlayer,
      null,
      this
    );

    // Boss 攻击定时器
    this.bossAttackTimer = this.time.addEvent({
      delay: 2500,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // UI 文本
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

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff'
    });
    this.gameOverText.setOrigin(0.5);
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
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.playerShoot();
      this.lastFired = time;
    }

    // 清理超出边界的子弹
    this.playerBullets.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossAttacks.children.entries.forEach((attack) => {
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
      bullet.body.setVelocityY(-400);
    }
  }

  bossAttack() {
    if (this.gameOver) {
      return;
    }

    // 发射 5 个攻击弹幕，呈扇形
    const angleStep = 30;
    const startAngle = -60;
    
    for (let i = 0; i < 5; i++) {
      const attack = this.bossAttacks.get(this.boss.x, this.boss.y + 40);
      if (attack) {
        attack.setActive(true);
        attack.setVisible(true);
        
        const angle = startAngle + (i * angleStep);
        const radian = Phaser.Math.DegToRad(angle + 90);
        const speed = 200;
        
        attack.body.setVelocity(
          Math.cos(radian) * speed,
          Math.sin(radian) * speed
        );
      }
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.bossHealth--;
    this.score += 100;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss 受击闪烁
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

  hitPlayer(attack, player) {
    attack.setActive(false);
    attack.setVisible(false);
    
    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家受击闪烁
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
    this.gameOver = true;
    this.physics.pause();
    this.bossAttackTimer.destroy();
    
    this.gameOverText.setText('YOU WIN!\nScore: ' + this.score);
    this.gameOverText.setStyle({ fill: '#00ff00' });
    
    console.log('Game Won! Final Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.physics.pause();
    this.bossAttackTimer.destroy();
    
    this.gameOverText.setText('GAME OVER\nScore: ' + this.score);
    this.gameOverText.setStyle({ fill: '#ff0000' });
    
    console.log('Game Over! Final Score:', this.score);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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