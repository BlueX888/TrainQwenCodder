class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 12;
    this.playerHealth = 3;
    this.gameOver = false;
    this.victory = false;
  }

  preload() {
    // 使用Graphics生成纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理 - 蓝色三角形
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Boss纹理 - 红色大方块
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.lineStyle(4, 0xffff00, 1);
    bossGraphics.strokeRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 玩家子弹 - 青色小方块
    const playerBulletGraphics = this.add.graphics();
    playerBulletGraphics.fillStyle(0x00ffff, 1);
    playerBulletGraphics.fillRect(0, 0, 8, 16);
    playerBulletGraphics.generateTexture('playerBullet', 8, 16);
    playerBulletGraphics.destroy();

    // Boss子弹 - 橙色圆形
    const bossBulletGraphics = this.add.graphics();
    bossBulletGraphics.fillStyle(0xff6600, 1);
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
    
    // 玩家射击冷却
    this.canShoot = true;
    this.shootCooldown = 300;

    // Boss攻击模式 - 每1秒发射攻击
    this.bossAttackTimer = this.time.addEvent({
      delay: 1000,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // Boss移动模式
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
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/12`, {
      fontSize: '24px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });

    this.playerHealthText = this.add.text(16, 50, `Player HP: ${this.playerHealth}/3`, {
      fontSize: '24px',
      fill: '#00aaff',
      fontStyle: 'bold'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加控制提示
    this.add.text(400, 580, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '16px',
      fill: '#ffffff'
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
    if (this.spaceKey.isDown && this.canShoot) {
      this.playerShoot();
    }

    // 清理超出屏幕的子弹
    this.playerBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    this.bossBullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y > 620) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  playerShoot() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
  }

  bossAttack() {
    if (this.gameOver || this.victory) {
      return;
    }

    // Boss攻击模式：发射多个子弹
    const patterns = [
      this.spreadShot.bind(this),
      this.directShot.bind(this),
      this.circularShot.bind(this)
    ];

    // 根据Boss血量选择攻击模式
    let patternIndex = 0;
    if (this.bossHealth <= 4) {
      patternIndex = 2; // 血量低时使用圆形弹幕
    } else if (this.bossHealth <= 8) {
      patternIndex = Math.floor(Math.random() * 2); // 中等血量随机使用前两种
    } else {
      patternIndex = 0; // 高血量使用扇形射击
    }

    patterns[patternIndex]();
  }

  spreadShot() {
    // 扇形射击
    const angles = [-30, -15, 0, 15, 30];
    angles.forEach(angle => {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const rad = Phaser.Math.DegToRad(90 + angle);
        const speed = 200;
        bullet.body.setVelocity(
          Math.cos(rad) * speed,
          Math.sin(rad) * speed
        );
      }
    });
  }

  directShot() {
    // 直线射击（追踪玩家）
    for (let i = 0; i < 3; i++) {
      const bullet = this.bossBullets.get(this.boss.x + (i - 1) * 30, this.boss.y + 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        
        const angle = Phaser.Math.Angle.Between(
          bullet.x, bullet.y,
          this.player.x, this.player.y
        );
        
        const speed = 250;
        bullet.body.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
      }
    }
  }

  circularShot() {
    // 圆形弹幕
    const bulletCount = 8;
    for (let i = 0; i < bulletCount; i++) {
      const bullet = this.bossBullets.get(this.boss.x, this.boss.y + 40);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        const angle = (360 / bulletCount) * i;
        const rad = Phaser.Math.DegToRad(angle);
        const speed = 150;
        bullet.body.setVelocity(
          Math.cos(rad) * speed,
          Math.sin(rad) * speed
        );
      }
    }
  }

  changeBossDirection() {
    if (this.gameOver || this.victory) {
      return;
    }

    // Boss左右移动
    if (this.boss.x <= 100) {
      this.boss.body.setVelocityX(100);
    } else if (this.boss.x >= 700) {
      this.boss.body.setVelocityX(-100);
    } else {
      this.boss.body.setVelocityX(this.boss.body.velocity.x * -1);
    }
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.bossHealth--;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}/12`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.endGame(true);
    }
  }

  hitPlayer(bullet, player) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    this.playerHealth--;
    this.playerHealthText.setText(`Player HP: ${this.playerHealth}/3`);

    // 玩家受击闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.endGame(false);
    }
  }

  endGame(isVictory) {
    // 停止所有定时器
    this.bossAttackTimer.remove();
    this.bossMoveTimer.remove();

    // 停止所有移动
    this.player.setVelocity(0, 0);
    this.boss.setVelocity(0, 0);

    // 清除所有子弹
    this.playerBullets.clear(true, true);
    this.bossBullets.clear(true, true);

    if (isVictory) {
      this.statusText.setText('VICTORY!');
      this.statusText.setColor('#00ff00');
      console.log('Game Status: Victory! Boss defeated!');
    } else {
      this.statusText.setText('GAME OVER');
      this.statusText.setColor('#ff0000');
      console.log('Game Status: Game Over! Player defeated!');
    }

    // 显示重启提示
    this.time.delayedCall(2000, () => {
      this.add.text(400, 360, 'Press R to Restart', {
        fontSize: '24px',
        fill: '#ffffff'
      }).setOrigin(0.5);

      this.input.keyboard.once('keydown-R', () => {
        this.scene.restart();
      });
    });
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

new Phaser.Game(config);