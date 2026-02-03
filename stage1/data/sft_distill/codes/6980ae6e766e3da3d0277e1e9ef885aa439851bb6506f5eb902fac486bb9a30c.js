class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 12;
    this.maxBossHealth = 12;
    this.gameOver = false;
    this.victory = false;
    this.playerSpeed = 300;
    this.bulletSpeed = 400;
    this.bossAttackSpeed = 200;
    this.lastFireTime = 0;
    this.fireDelay = 300;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建Boss纹理（红色大方块）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建玩家子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture('bullet', 16, 16);
    bulletGraphics.destroy();

    // 创建Boss攻击波纹理（紫色圆）
    const attackGraphics = this.add.graphics();
    attackGraphics.fillStyle(0xff00ff, 1);
    attackGraphics.fillCircle(12, 12, 12);
    attackGraphics.generateTexture('bossAttack', 24, 24);
    attackGraphics.destroy();
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000033, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setImmovable(true);

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

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

    // Boss攻击定时器（每1秒发射）
    this.bossAttackTimer = this.time.addEvent({
      delay: 1000,
      callback: this.bossAttack,
      callbackScope: this,
      loop: true
    });

    // UI文本
    this.bossHealthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(400, 550, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '18px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 绘制Boss血条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x666666, 1);
    this.healthBarBg.fillRect(300, 50, 200, 20);

    // 绘制Boss血条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();
  }

  update(time, delta) {
    if (this.gameOver || this.victory) {
      return;
    }

    // 玩家移动
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 玩家射击
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireDelay) {
      this.firePlayerBullet();
      this.lastFireTime = time;
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

  firePlayerBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -this.bulletSpeed;
    }
  }

  bossAttack() {
    if (this.gameOver || this.victory) {
      return;
    }

    // Boss发射3个攻击波（扇形分布）
    const angles = [-30, 0, 30];
    angles.forEach(angle => {
      const attack = this.bossAttacks.get(this.boss.x, this.boss.y + 40);
      if (attack) {
        attack.setActive(true);
        attack.setVisible(true);
        
        const rad = Phaser.Math.DegToRad(90 + angle);
        const velocityX = Math.cos(rad) * this.bossAttackSpeed;
        const velocityY = Math.sin(rad) * this.bossAttackSpeed;
        
        attack.body.velocity.x = velocityX;
        attack.body.velocity.y = velocityY;
      }
    });
  }

  hitBoss(bullet, boss) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();

    this.bossHealth--;
    this.bossHealthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);
    this.updateHealthBar();

    // Boss闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    if (this.bossHealth <= 0) {
      this.victory = true;
      this.bossAttackTimer.remove();
      boss.setVisible(false);
      this.statusText.setText('VICTORY!');
      this.statusText.setVisible(true);
      
      // 停止所有攻击
      this.bossAttacks.clear(true, true);
    }
  }

  hitPlayer(player, attack) {
    attack.setActive(false);
    attack.setVisible(false);
    attack.body.stop();

    this.gameOver = true;
    this.bossAttackTimer.remove();
    
    player.setTint(0xff0000);
    this.statusText.setText('GAME OVER');
    this.statusText.setVisible(true);

    // 停止所有移动
    player.body.stop();
    this.bossAttacks.clear(true, true);
    this.playerBullets.clear(true, true);
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 200 * healthPercent;
    
    // 根据血量改变颜色
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xffaa00; // 橙色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(300, 50, barWidth, 20);
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