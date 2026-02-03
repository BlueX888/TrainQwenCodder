class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 15;
    this.maxBossHealth = 15;
    this.gameOver = false;
    this.bullets = null;
    this.lastFired = 0;
    this.fireRate = 300; // 发射间隔（毫秒）
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0xff0000, 1);
    bossGraphics.fillRect(0, 0, 80, 60);
    bossGraphics.fillStyle(0x8b0000, 1);
    bossGraphics.fillTriangle(40, 60, 20, 80, 60, 80);
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 150, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setImmovable(true);

    // Boss简单移动逻辑
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

    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI文本
    this.bossHealthText = this.add.text(16, 16, `Boss血量: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 血条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(300, 50, 200, 20);

    // 血条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 操作提示
    this.add.text(16, 560, '方向键移动 | 空格发射', {
      fontSize: '16px',
      fill: '#aaa',
      fontFamily: 'Arial'
    });

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, '胜利！', {
      fontSize: '64px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    const speed = 300;
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
      bullet.body.setVelocityY(-360); // 子弹速度360
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0);

    // Boss扣血
    this.bossHealth--;
    this.bossHealthText.setText(`Boss血量: ${this.bossHealth}/${this.maxBossHealth}`);
    this.updateHealthBar();

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        boss.alpha = 1;
      }
    });

    // 检查是否胜利
    if (this.bossHealth <= 0) {
      this.victory();
    }
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = this.bossHealth / this.maxBossHealth;
    const barWidth = 200 * healthPercent;
    
    // 根据血量变色
    let color = 0x00ff00;
    if (healthPercent < 0.3) {
      color = 0xff0000;
    } else if (healthPercent < 0.6) {
      color = 0xffaa00;
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(300, 50, barWidth, 20);
  }

  victory() {
    this.gameOver = true;
    
    // 停止Boss移动
    this.tweens.killTweensOf(this.boss);
    this.boss.body.setVelocity(0);
    
    // Boss爆炸效果
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 2,
      duration: 500,
      ease: 'Power2',
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
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 停止玩家移动
    this.player.body.setVelocity(0);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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