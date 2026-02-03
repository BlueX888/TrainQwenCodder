class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
    this.bossHealth = 8;
    this.playerHealth = 3;
    this.gameState = 'playing'; // playing, won, lost
    this.score = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建 Boss 纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('playerBullet', 10, 10);
    bulletGraphics.destroy();

    // 创建 Boss 攻击纹理
    const bossAttackGraphics = this.add.graphics();
    bossAttackGraphics.fillStyle(0xff00ff, 1);
    bossAttackGraphics.fillCircle(8, 8, 8);
    bossAttackGraphics.generateTexture('bossAttack', 16, 16);
    bossAttackGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setVelocityX(100);

    // 创建子弹组
    this.playerBullets = this.physics.add.group({
      defaultKey: 'playerBullet',
      maxSize: 20
    });

    // 创建 Boss 攻击组
    this.bossAttacks = this.physics.add.group({
      defaultKey: 'bossAttack',
      maxSize: 30
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastShotTime = 0;

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

    // 显示文本
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.playerHealthText = this.add.text(16, 50, `Player HP: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#fff'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(16, 84, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#fff'
    });
  }

  update(time, delta) {
    if (this.gameState !== 'playing') {
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

    // 玩家射击（每 300ms 一次）
    if (this.spaceKey.isDown && time > this.lastShotTime + 300) {
      this.shootPlayerBullet();
      this.lastShotTime = time;
    }

    // Boss 左右移动
    if (this.boss.x <= 40 || this.boss.x >= 760) {
      this.boss.setVelocityX(-this.boss.body.velocity.x);
    }

    // 清理屏幕外的子弹
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
    if (this.gameState !== 'playing') {
      return;
    }

    // Boss 发射 3 个攻击波
    const patterns = [
      { x: this.boss.x, y: this.boss.y + 40 },
      { x: this.boss.x - 30, y: this.boss.y + 40 },
      { x: this.boss.x + 30, y: this.boss.y + 40 }
    ];

    patterns.forEach(pos => {
      const attack = this.bossAttacks.get(pos.x, pos.y);
      if (attack) {
        attack.setActive(true);
        attack.setVisible(true);
        attack.setVelocityY(200);
        
        // 添加一些随机性
        const angle = Phaser.Math.Between(-30, 30);
        attack.setVelocityX(Math.sin(angle * Math.PI / 180) * 100);
      }
    });
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    this.bossHealth -= 1;
    this.score += 10;
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
      this.gameWon();
    }
  }

  hitPlayer(attack, player) {
    attack.setActive(false);
    attack.setVisible(false);
    attack.setVelocity(0, 0);

    this.playerHealth -= 1;
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
      this.gameLost();
    }
  }

  gameWon() {
    this.gameState = 'won';
    this.statusText.setText('YOU WIN!');
    this.bossAttackTimer.remove();
    this.boss.setVelocity(0, 0);
    this.player.setVelocity(0, 0);
    
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
  }

  gameLost() {
    this.gameState = 'lost';
    this.statusText.setText('GAME OVER');
    this.bossAttackTimer.remove();
    this.boss.setVelocity(0, 0);
    this.player.setVelocity(0, 0);
    
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      duration: 500
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
  scene: BossScene
};

new Phaser.Game(config);