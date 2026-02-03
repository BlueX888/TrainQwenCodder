class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
    this.bossHealth = 15;
    this.maxBossHealth = 15;
    this.gameOver = false;
    this.bulletSpeed = 200;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      bossHealth: this.bossHealth,
      bulletsHit: 0,
      gameWon: false,
      events: []
    };

    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 10, 15, 10);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建Boss纹理（蓝色矩形）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x0000ff, 1);
    bossGraphics.fillRect(0, 0, 100, 80);
    bossGraphics.generateTexture('boss', 100, 80);
    bossGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setImmovable(true);

    // Boss简单左右移动
    this.tweens.add({
      targets: this.boss,
      x: 200,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // Boss血条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x555555, 1);
    this.healthBarBg.fillRect(300, 30, 200, 20);

    // Boss血条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // Boss血量文本
    this.healthText = this.add.text(400, 40, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 碰撞检测：子弹与Boss
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // 记录游戏开始事件
    this.logEvent('game_start');
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
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
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-this.bulletSpeed);
      this.logEvent('bullet_fired', { x: bullet.x, y: bullet.y });
    }
  }

  hitBoss(bullet, boss) {
    // 子弹命中Boss
    bullet.setActive(false);
    bullet.setVisible(false);

    // Boss扣血
    this.bossHealth--;
    window.__signals__.bossHealth = this.bossHealth;
    window.__signals__.bulletsHit++;

    this.logEvent('boss_hit', { 
      remainingHealth: this.bossHealth,
      totalHits: window.__signals__.bulletsHit
    });

    // 更新血条和文本
    this.updateHealthBar();
    this.healthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);

    // Boss闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true
    });

    // 检查Boss是否被击败
    if (this.bossHealth <= 0) {
      this.defeatBoss();
    }
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
    this.healthBar.fillRect(300, 30, barWidth, 20);
  }

  defeatBoss() {
    this.gameOver = true;
    window.__signals__.gameWon = true;

    this.logEvent('boss_defeated', { 
      totalBulletsHit: window.__signals__.bulletsHit 
    });

    // Boss爆炸效果
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      onComplete: () => {
        this.boss.destroy();
      }
    });

    // 显示胜利文本
    this.victoryText.setVisible(true);
    this.tweens.add({
      targets: this.victoryText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    console.log('=== GAME WON ===');
    console.log('Final Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  logEvent(eventName, data = {}) {
    const event = {
      timestamp: Date.now(),
      event: eventName,
      ...data
    };
    window.__signals__.events.push(event);
    console.log(`[Event] ${eventName}:`, data);
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

const game = new Phaser.Game(config);