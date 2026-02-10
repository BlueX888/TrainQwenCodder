class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 15;
    this.maxBossHealth = 15;
    this.bulletsHit = 0;
    this.gameWon = false;
  }

  preload() {
    // 创建玩家纹理（绿色矩形）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建Boss纹理（蓝色圆形）
    const bossGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bossGraphics.fillStyle(0x0000ff, 1);
    bossGraphics.fillCircle(50, 50, 50);
    bossGraphics.generateTexture('boss', 100, 100);
    bossGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      bossHealth: this.bossHealth,
      maxBossHealth: this.maxBossHealth,
      bulletsHit: this.bulletsHit,
      gameWon: this.gameWon,
      timestamp: Date.now()
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 150, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setImmovable(true);

    // Boss简单左右移动
    this.tweens.add({
      targets: this.boss,
      x: 600,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireDelay = 300; // 发射间隔

    // 碰撞检测：子弹击中Boss
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    // UI：Boss血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x555555, 1);
    this.healthBarBg.fillRect(300, 50, 200, 20);

    // UI：Boss血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // UI：血量文本
    this.healthText = this.add.text(400, 30, `Boss HP: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.healthText.setOrigin(0.5);

    // UI：操作提示
    this.add.text(400, 580, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    console.log('[BossBattle] Game started', window.__signals__);
  }

  update(time, delta) {
    if (this.gameWon) {
      return; // 游戏胜利后停止更新
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

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireDelay) {
      this.fireBullet();
      this.lastFireTime = time;
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-200); // 子弹速度200
      
      // 子弹超出屏幕后回收
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.setVelocity(0, 0);
        }
      });
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);

    // Boss扣血
    this.bossHealth -= 1;
    this.bulletsHit += 1;

    // 更新UI
    this.updateHealthBar();
    this.healthText.setText(`Boss HP: ${this.bossHealth}/${this.maxBossHealth}`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 更新信号
    window.__signals__.bossHealth = this.bossHealth;
    window.__signals__.bulletsHit = this.bulletsHit;
    window.__signals__.timestamp = Date.now();

    console.log(`[BossBattle] Boss hit! HP: ${this.bossHealth}/${this.maxBossHealth}`);

    // 检查胜利条件
    if (this.bossHealth <= 0) {
      this.winGame();
    }
  }

  updateHealthBar() {
    this.healthBar.clear();
    const healthPercent = Math.max(0, this.bossHealth / this.maxBossHealth);
    const barWidth = 200 * healthPercent;
    
    // 血量颜色根据百分比变化
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xffaa00; // 橙色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(300, 50, barWidth, 20);
  }

  winGame() {
    this.gameWon = true;
    
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

    // 停止Boss移动
    this.tweens.killTweensOf(this.boss);
    this.boss.body.setVelocity(0, 0);

    // 停止所有子弹
    this.bullets.children.entries.forEach(bullet => {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.setVelocity(0, 0);
    });

    // 更新信号
    window.__signals__.gameWon = true;
    window.__signals__.bossHealth = 0;
    window.__signals__.timestamp = Date.now();

    console.log('[BossBattle] Victory!', window.__signals__);
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