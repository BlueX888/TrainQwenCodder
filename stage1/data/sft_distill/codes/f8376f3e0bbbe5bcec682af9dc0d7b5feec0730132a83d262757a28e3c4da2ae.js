class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.maxBossHealth = 8;
    this.gameOver = false;
    this.victory = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x0000ff, 1);
    bossGraphics.fillRect(-40, -40, 80, 80);
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillCircle(-20, -20, 8);
    bossGraphics.fillCircle(20, -20, 8);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 150, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100);

    // Boss移动逻辑：左右移动
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (!this.gameOver) {
          this.boss.body.setVelocityX(-this.boss.body.velocity.x);
        }
      },
      loop: true
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
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
    this.healthBarBg.fillStyle(0x808080, 1);
    this.healthBarBg.fillRect(250, 50, 300, 20);

    // 血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    // 提示文本
    this.add.text(16, 550, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '18px',
      fill: '#fff'
    });
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

    // 射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shootBullet();
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-120); // 子弹速度 120
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
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
      this.victory = true;
      this.gameOver = true;
      this.showVictory();
    }
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 300 * healthPercent;
    
    // 根据血量变色
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xffff00; // 黄色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(250, 50, barWidth, 20);
  }

  showVictory() {
    // 停止Boss移动
    this.boss.body.setVelocity(0, 0);
    
    // 显示胜利文本
    this.victoryText.setVisible(true);
    
    // 胜利文本动画
    this.tweens.add({
      targets: this.victoryText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 停止玩家移动
    this.player.body.setVelocity(0, 0);
    
    // 清除所有子弹
    this.bullets.clear(true, true);

    console.log('Victory! Boss defeated!');
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