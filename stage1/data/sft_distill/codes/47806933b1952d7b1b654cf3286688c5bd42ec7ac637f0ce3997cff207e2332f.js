// 完整的 Phaser3 射击游戏代码
class ShootingGame extends Phaser.Scene {
  constructor() {
    super('ShootingGame');
    this.killCount = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      killCount: 0,
      bulletsCreated: 0,
      enemiesDestroyed: 0,
      events: []
    };

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy'
    });

    // 生成初始敌人
    this.spawnEnemies();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 监听鼠标点击事件
    this.input.on('pointerdown', this.shootBullet, this);

    // 显示击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 添加说明文本
    this.add.text(16, 50, 'Click to shoot!', {
      fontSize: '18px',
      fill: '#aaa',
      fontFamily: 'Arial'
    });

    // 定时生成新敌人
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true
    });

    // 记录初始事件
    this.logEvent('game_started', { enemyCount: this.enemies.getLength() });
  }

  spawnEnemies() {
    // 随机生成 3-5 个敌人
    const count = Phaser.Math.Between(3, 5);
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 300);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  shootBullet(pointer) {
    // 从玩家位置发射子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算子弹方向（从玩家指向鼠标位置）
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // 设置子弹速度为 200
      this.physics.velocityFromRotation(angle, 200, bullet.body.velocity);

      // 子弹超出边界后自动销毁
      bullet.setCollideWorldBounds(true);
      bullet.body.onWorldBounds = true;
      
      this.physics.world.on('worldbounds', (body) => {
        if (body.gameObject === bullet) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });

      // 更新 signals
      window.__signals__.bulletsCreated++;
      this.logEvent('bullet_fired', {
        x: this.player.x,
        y: this.player.y,
        targetX: pointer.x,
        targetY: pointer.y
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 更新 signals
    window.__signals__.killCount = this.killCount;
    window.__signals__.enemiesDestroyed++;
    
    this.logEvent('enemy_killed', {
      killCount: this.killCount,
      enemyX: enemy.x,
      enemyY: enemy.y
    });

    // 创建击杀特效（简单的闪烁圆圈）
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data
    };
    window.__signals__.events.push(event);
    console.log('[GAME_EVENT]', JSON.stringify(event));
  }

  update(time, delta) {
    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (
        bullet.x < -50 || bullet.x > 850 ||
        bullet.y < -50 || bullet.y > 650
      )) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: ShootingGame
};

// 启动游戏
new Phaser.Game(config);