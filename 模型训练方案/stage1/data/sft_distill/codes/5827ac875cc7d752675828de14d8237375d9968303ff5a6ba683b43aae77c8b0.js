// Boss战游戏 - 紫色Boss 8点血量
class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
    this.bossHealth = 8;
    this.maxHealth = 8;
    this.gameOver = false;
  }

  preload() {
    // 使用Graphics程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建紫色Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x9933ff, 1);
    bossGraphics.fillCircle(40, 40, 40);
    bossGraphics.fillStyle(0x6600cc, 1);
    bossGraphics.fillCircle(30, 30, 10); // 左眼
    bossGraphics.fillCircle(50, 30, 10); // 右眼
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建黄色子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture('bullet', 16, 16);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      bossHealth: this.bossHealth,
      bulletsFired: 0,
      bulletsHit: 0,
      gameWon: false,
      events: []
    };

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 200, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setBounce(1, 1);
    this.boss.setVelocity(100, 100);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      this.hitBoss,
      null,
      this
    );

    // 点击发射子弹
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameOver) {
        this.shootBullet(pointer);
      }
    });

    // UI文本
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      fill: '#fff',
      fontStyle: 'bold'
    });

    this.infoText = this.add.text(16, 50, 'Click to shoot!', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });
    this.victoryText.setOrigin(0.5);

    // 记录初始状态
    this.logEvent('game_start', { bossHealth: this.bossHealth });
  }

  shootBullet(pointer) {
    // 从屏幕底部中心发射
    const startX = 400;
    const startY = 550;

    const bullet = this.bullets.get(startX, startY, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算朝向点击位置的方向
      const angle = Phaser.Math.Angle.Between(startX, startY, pointer.x, pointer.y);
      
      this.physics.velocityFromRotation(angle, 300, bullet.body.velocity);

      // 子弹超出屏幕自动销毁
      bullet.setCollideWorldBounds(true);
      bullet.body.onWorldBounds = true;
      
      this.physics.world.on('worldbounds', (body) => {
        if (body.gameObject === bullet) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });

      // 更新信号
      window.__signals__.bulletsFired++;
      this.logEvent('bullet_fired', {
        position: { x: startX, y: startY },
        target: { x: pointer.x, y: pointer.y }
      });
    }
  }

  hitBoss(bullet, boss) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);

    // Boss扣血
    this.bossHealth--;
    window.__signals__.bossHealth = this.bossHealth;
    window.__signals__.bulletsHit++;

    // 更新血量显示
    this.healthText.setText(`Boss HP: ${this.bossHealth}/${this.maxHealth}`);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    this.logEvent('boss_hit', {
      remainingHealth: this.bossHealth,
      position: { x: boss.x, y: boss.y }
    });

    // 检查是否胜利
    if (this.bossHealth <= 0) {
      this.winGame();
    }
  }

  winGame() {
    this.gameOver = true;
    window.__signals__.gameWon = true;

    // 停止Boss移动
    this.boss.setVelocity(0, 0);

    // Boss消失动画
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 0,
      duration: 500,
      ease: 'Power2'
    });

    // 显示胜利文本
    this.victoryText.setText('VICTORY!');
    this.victoryText.setScale(0);
    this.tweens.add({
      targets: this.victoryText,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    this.infoText.setText('You defeated the Boss!');

    this.logEvent('game_won', {
      bulletsFired: window.__signals__.bulletsFired,
      bulletsHit: window.__signals__.bulletsHit,
      accuracy: (window.__signals__.bulletsHit / window.__signals__.bulletsFired * 100).toFixed(1) + '%'
    });

    console.log('=== GAME WON ===');
    console.log('Bullets Fired:', window.__signals__.bulletsFired);
    console.log('Bullets Hit:', window.__signals__.bulletsHit);
    console.log('Final Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  logEvent(eventType, data) {
    const event = {
      timestamp: Date.now(),
      type: eventType,
      data: data
    };
    window.__signals__.events.push(event);
    console.log(`[${eventType}]`, data);
  }

  update(time, delta) {
    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.y < -50 || bullet.y > 650 || bullet.x < -50 || bullet.x > 850) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });
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
  scene: BossScene
};

// 启动游戏
const game = new Phaser.Game(config);