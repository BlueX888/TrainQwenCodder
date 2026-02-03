class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 5;
    this.maxBossHealth = 5;
    this.gameOver = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bullet', 8, 16);
    bulletGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bossGraphics.fillStyle(0x00ff00, 1);
    bossGraphics.fillCircle(50, 50, 50);
    bossGraphics.generateTexture('boss', 100, 100);
    bossGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 150, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;
    this.fireDelay = 300; // 发射间隔

    // Boss血条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(300, 50, 200, 20);

    // Boss血条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文字
    this.healthText = this.add.text(400, 60, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 胜利文字（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // 添加状态信号用于验证
    this.registry.set('bossHealth', this.bossHealth);
    this.registry.set('victory', false);
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
      this.lastFired = time + this.fireDelay;
    }

    // Boss左右移动
    if (this.boss.x <= 100) {
      this.boss.body.setVelocityX(100);
    } else if (this.boss.x >= 700) {
      this.boss.body.setVelocityX(-100);
    }

    // 清理屏幕外的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
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
      bullet.body.setVelocityY(-240); // 子弹速度240
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);

    // Boss扣血
    this.bossHealth--;
    this.registry.set('bossHealth', this.bossHealth);

    // 更新血条和文字
    this.updateHealthBar();
    this.healthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);

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
    this.registry.set('victory', true);

    // 显示胜利文字
    this.victoryText.setVisible(true);

    // 胜利文字动画
    this.tweens.add({
      targets: this.victoryText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
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
    this.player.setVelocity(0, 0);

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

const game = new Phaser.Game(config);