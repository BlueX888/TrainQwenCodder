class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    
    // 可验证的状态信号
    this.playerHealth = 3;
    this.bossHealth = 5;
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
    bossGraphics.fillRect(0, 0, 64, 64);
    bossGraphics.generateTexture('boss', 64, 64);
    bossGraphics.destroy();

    // 创建玩家子弹纹理
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0xffff00, 1);
    playerBulletGraphics.fillCircle(4, 4, 4);
    playerBulletGraphics.generateTexture('playerBullet', 8, 8);
    playerBulletGraphics.destroy();

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

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.lastFired = 0;
    this.fireDelay = 300;

    // Boss攻击定时器 - 每1秒发射攻击
    this.bossAttackTimer = this.time.addEvent({
      delay: 1000,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // Boss移动模式定时器
    this.bossMoveTimer = this.time.addEvent({
      delay: 2000,
      callback: this.changeBossDirection,
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
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 玩家射击
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.playerShoot();
      this.lastFired = time + this.fireDelay;
    }

    // Boss边界反弹
    if (this.boss.x <= 32 || this.boss.x >= 768) {
      this.boss.setVelocityX(-this.boss.body.velocity.x);
    }

    // 清理越界子弹
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
  }

  playerShoot() {
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

    // Boss发射3发子弹（扇形攻击）
    const angles = [-20, 0, 20];
    
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y);
      
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        
        const radians = Phaser.Math.DegToRad(90 + angle);
        const speed = 200;
        bullet.setVelocity(
          Math.cos(radians) * speed,
          Math.sin(radians) * speed
        );
      }
    });
  }

  changeBossDirection() {
    if (this.gameOver) {
      return;
    }

    // 随机改变Boss移动方向
    const directions = [-150, -100, 100, 150];
    const newVelocity = Phaser.Math.RND.pick(directions);
    this.boss.setVelocityX(newVelocity);
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.bossHealth--;
    this.score += 100;
    
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Boss受伤闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.endGame('VICTORY!');
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}`);

    // 玩家受伤闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.playerHealth <= 0) {
      this.victory = false;
      this.endGame('GAME OVER!');
    }
  }

  endGame(message) {
    this.gameOver = true;
    
    // 停止所有定时器
    this.bossAttackTimer.remove();
    this.bossMoveTimer.remove();
    
    // 停止所有移动
    this.player.setVelocity(0);
    this.boss.setVelocity(0);
    this.playerBullets.clear(true, true);
    this.bossBullets.clear(true, true);

    // 显示结束信息
    this.statusText.setText(message);
    
    // 添加重启提示
    this.add.text(400, 350, 'Press R to Restart', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 重启按键
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });

    // 输出最终状态
    console.log('Game Over!');
    console.log('Player Health:', this.playerHealth);
    console.log('Boss Health:', this.bossHealth);
    console.log('Score:', this.score);
    console.log('Victory:', this.victory);
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