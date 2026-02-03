class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 3;
    this.maxBossHealth = 3;
    this.gameOver = false;
    this.lastFired = 0;
    this.fireRate = 300; // 发射间隔
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 10, 15, 10);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x00ffff, 1);
    bossGraphics.fillRect(-40, -30, 80, 60);
    bossGraphics.fillStyle(0x0088aa, 1);
    bossGraphics.fillCircle(-25, -10, 8);
    bossGraphics.fillCircle(25, -10, 8);
    bossGraphics.generateTexture('boss', 80, 60);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(150);
    this.boss.body.setBounce(1, 0);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // UI文本
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#00ffff',
      fontStyle: 'bold'
    });

    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00',
      fontStyle: 'bold'
    });
    this.victoryText.setOrigin(0.5);

    // Boss血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x666666, 1);
    this.healthBarBg.fillRect(300, 50, 200, 20);

    // Boss血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 提示文本
    this.add.text(400, 580, 'Arrow Keys: Move | Space: Fire', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
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

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-120); // 子弹速度120
    }
  }

  hitBoss(bullet, boss) {
    if (!this.gameOver) {
      // 销毁子弹
      bullet.setActive(false);
      bullet.setVisible(false);

      // Boss扣血
      this.bossHealth--;
      this.healthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);
      this.updateHealthBar();

      // Boss闪烁效果
      this.tweens.add({
        targets: boss,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 1
      });

      // 检查胜利条件
      if (this.bossHealth <= 0) {
        this.victory();
      }
    }
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 200 * healthPercent;
    
    // 根据血量改变颜色
    let color = 0x00ff00;
    if (healthPercent <= 0.33) {
      color = 0xff0000;
    } else if (healthPercent <= 0.66) {
      color = 0xffaa00;
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(300, 50, barWidth, 20);
  }

  victory() {
    this.gameOver = true;
    
    // 停止Boss移动
    this.boss.body.setVelocity(0, 0);
    
    // Boss爆炸效果
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => {
        this.boss.destroy();
      }
    });

    // 显示胜利文本
    this.victoryText.setText('VICTORY!');
    this.tweens.add({
      targets: this.victoryText,
      scale: { from: 0, to: 1.5 },
      alpha: { from: 0, to: 1 },
      duration: 1000,
      ease: 'Bounce.easeOut'
    });

    // 停止玩家移动
    this.player.body.setVelocity(0, 0);
    
    // 清除所有子弹
    this.bullets.clear(true, true);
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