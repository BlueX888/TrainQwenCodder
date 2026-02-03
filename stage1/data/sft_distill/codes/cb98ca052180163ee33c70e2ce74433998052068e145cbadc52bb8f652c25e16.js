class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.maxBossHealth = 8;
    this.gameOver = false;
    this.lastFired = 0;
    this.fireRate = 300; // 发射间隔（毫秒）
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色三角形飞船）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 20);
    playerGraphics.lineTo(15, 20);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建Boss纹理（蓝色大方块）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x0000ff, 1);
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.lineStyle(3, 0x00ffff, 1);
    bossGraphics.strokeRect(0, 0, 80, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100);
    
    // Boss左右移动逻辑
    this.boss.body.setBounce(1, 0);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 碰撞检测：子弹击中Boss
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    // UI文本
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.victoryText.setOrigin(0.5);

    // Boss血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(300, 50, 200, 20);

    // Boss血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 提示文本
    this.add.text(400, 550, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '18px',
      fill: '#cccccc',
      fontFamily: 'Arial'
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

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 清理超出边界的子弹
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
    // 子弹消失
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);

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

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 200 * healthPercent;
    
    // 根据血量变色
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xffaa00; // 橙色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(300, 50, barWidth, 20);
  }

  victory() {
    this.gameOver = true;
    
    // 停止Boss移动
    this.boss.body.setVelocity(0, 0);
    
    // 显示胜利文本
    this.victoryText.setText('VICTORY!');
    
    // 胜利动画
    this.tweens.add({
      targets: this.victoryText,
      scale: { from: 0, to: 1.5 },
      alpha: { from: 0, to: 1 },
      duration: 1000,
      ease: 'Bounce.easeOut'
    });

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

    // 停止玩家移动
    this.player.body.setVelocity(0, 0);

    // 清除所有子弹
    this.bullets.clear(true, true);

    console.log('Boss defeated! Victory achieved!');
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111111',
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