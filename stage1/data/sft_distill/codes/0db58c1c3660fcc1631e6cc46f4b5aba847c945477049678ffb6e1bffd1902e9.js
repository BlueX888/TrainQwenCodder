// 初始化可验证信号
window.__signals__ = {
  bossHealth: 8,
  bulletsFired: 0,
  bulletsHit: 0,
  gameWon: false,
  events: []
};

class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.maxBossHealth = 8;
    this.bullets = null;
    this.lastFire = 0;
    this.fireRate = 300; // 发射间隔（毫秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建 Boss 纹理（紫色矩形）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x9932cc, 1);
    bossGraphics.fillRect(0, 0, 100, 100);
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

    // 创建 Boss
    this.boss = this.physics.add.sprite(400, 150, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setImmovable(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 碰撞检测：子弹击中 Boss
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // UI 文本
    this.healthText = this.add.text(16, 16, `Boss Health: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // Boss 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x666666, 1);
    this.healthBarBg.fillRect(300, 50, 200, 20);

    // Boss 血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, 'VICTORY!', {
      fontSize: '64px',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    // 提示文本
    this.add.text(16, 560, 'Arrow Keys: Move | Space: Fire', {
      fontSize: '18px',
      fill: '#cccccc'
    });

    // 记录初始事件
    window.__signals__.events.push({
      time: 0,
      event: 'game_start',
      bossHealth: this.bossHealth
    });
  }

  update(time, delta) {
    if (this.bossHealth <= 0) {
      return; // 游戏结束，停止更新
    }

    // 玩家移动
    const speed = 200;
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
    if (this.spaceKey.isDown && time > this.lastFire) {
      this.fireBullet(time);
    }

    // Boss 简单移动模式（左右移动）
    if (!this.boss.getData('direction')) {
      this.boss.setData('direction', 1);
    }
    
    const bossSpeed = 100;
    this.boss.setVelocityX(bossSpeed * this.boss.getData('direction'));

    if (this.boss.x >= 750 || this.boss.x <= 50) {
      this.boss.setData('direction', this.boss.getData('direction') * -1);
    }
  }

  fireBullet(time) {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-300); // 子弹速度 300
      
      this.lastFire = time + this.fireRate;
      
      window.__signals__.bulletsFired++;
      window.__signals__.events.push({
        time: time,
        event: 'bullet_fired',
        position: { x: this.player.x, y: this.player.y }
      });
    }
  }

  hitBoss(bullet, boss) {
    // 子弹击中 Boss
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.destroy();

    this.bossHealth--;
    window.__signals__.bossHealth = this.bossHealth;
    window.__signals__.bulletsHit++;

    // 记录击中事件
    window.__signals__.events.push({
      time: this.time.now,
      event: 'boss_hit',
      remainingHealth: this.bossHealth
    });

    // Boss 受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 更新 UI
    this.healthText.setText(`Boss Health: ${this.bossHealth}/${this.maxBossHealth}`);
    this.updateHealthBar();

    // 检查胜利条件
    if (this.bossHealth <= 0) {
      this.victory();
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
      color = 0xff9900; // 橙色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(300, 50, barWidth, 20);
  }

  victory() {
    // 显示胜利文本
    this.victoryText.setVisible(true);
    
    // Boss 消失动画
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 0,
      duration: 500,
      ease: 'Power2'
    });

    // 暂停物理系统
    this.physics.pause();

    // 更新信号
    window.__signals__.gameWon = true;
    window.__signals__.events.push({
      time: this.time.now,
      event: 'victory',
      bulletsFired: window.__signals__.bulletsFired,
      bulletsHit: window.__signals__.bulletsHit,
      accuracy: (window.__signals__.bulletsHit / window.__signals__.bulletsFired * 100).toFixed(2) + '%'
    });

    // 输出最终统计
    console.log('=== GAME VICTORY ===');
    console.log('Bullets Fired:', window.__signals__.bulletsFired);
    console.log('Bullets Hit:', window.__signals__.bulletsHit);
    console.log('Accuracy:', (window.__signals__.bulletsHit / window.__signals__.bulletsFired * 100).toFixed(2) + '%');
    console.log('Events:', JSON.stringify(window.__signals__.events, null, 2));
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);