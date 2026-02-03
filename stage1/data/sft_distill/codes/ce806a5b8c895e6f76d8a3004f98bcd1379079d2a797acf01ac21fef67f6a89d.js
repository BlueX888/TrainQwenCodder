class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 5;
    this.maxBossHealth = 5;
    this.gameWon = false;
    this.bulletSpeed = 240;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建Boss纹理（绿色圆形）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x00ff00, 1);
    bossGraphics.fillCircle(50, 50, 50);
    bossGraphics.generateTexture('boss', 100, 100);
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
    this.boss = this.physics.add.sprite(400, 150, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setVelocityX(100);

    // Boss左右移动逻辑
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this.boss) {
        this.boss.setVelocityX(-this.boss.body.velocity.x);
      }
    });
    this.boss.body.onWorldBounds = true;

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 发射冷却
    this.canShoot = true;
    this.shootCooldown = 300;

    // 碰撞检测：子弹击中Boss
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // UI文本
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x666666, 1);
    this.healthBarBg.fillRect(350, 50, 200, 20);

    // 血量条前景
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      fill: '#ffff00',
      stroke: '#000',
      strokeThickness: 6
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    // 调试信息
    this.debugText = this.add.text(16, 550, '', {
      fontSize: '16px',
      fill: '#fff'
    });
  }

  update(time, delta) {
    if (this.gameWon) {
      return; // 游戏胜利后停止更新
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // 发射子弹
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shootBullet();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 更新调试信息
    this.debugText.setText([
      `Boss Health: ${this.bossHealth}`,
      `Active Bullets: ${this.bullets.countActive(true)}`,
      `Game Won: ${this.gameWon}`
    ]);
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-this.bulletSpeed);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

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
      this.winGame();
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
    this.healthBar.fillRect(350, 50, barWidth, 20);
  }

  winGame() {
    this.gameWon = true;
    
    // 停止Boss移动
    this.boss.setVelocity(0, 0);
    
    // Boss消失动画
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 0,
      duration: 500,
      onComplete: () => {
        this.boss.destroy();
      }
    });

    // 显示胜利文本
    this.victoryText.setVisible(true);
    this.tweens.add({
      targets: this.victoryText,
      scale: { from: 0, to: 1.2 },
      duration: 500,
      ease: 'Bounce.easeOut'
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);
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