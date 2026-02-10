class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
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

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 显示击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 初始化信号
    window.__signals__ = {
      killCount: 0,
      bulletsActive: 0,
      enemiesActive: 0
    };

    // 添加射击冷却
    this.lastFireTime = 0;
    this.fireRate = 250; // 毫秒
  }

  spawnEnemies() {
    // 在随机位置生成 8 个敌人
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 确保不在玩家附近生成
      if (Phaser.Math.Distance.Between(x, y, 400, 300) > 100) {
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(-50, 50)
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
      }
    }
  }

  fireBullet(direction) {
    const currentTime = this.time.now;
    
    // 检查射击冷却
    if (currentTime - this.lastFireTime < this.fireRate) {
      return;
    }

    this.lastFireTime = currentTime;

    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 根据方向设置速度 (速度 160)
      switch (direction) {
        case 'up':
          bullet.setVelocity(0, -160);
          break;
        case 'down':
          bullet.setVelocity(0, 160);
          break;
        case 'left':
          bullet.setVelocity(-160, 0);
          break;
        case 'right':
          bullet.setVelocity(160, 0);
          break;
      }

      // 子弹超出边界时销毁
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
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

    // 更新信号
    window.__signals__.killCount = this.killCount;

    // 输出日志
    console.log(JSON.stringify({
      event: 'enemy_killed',
      killCount: this.killCount,
      timestamp: this.time.now
    }));

    // 如果所有敌人被消灭，生成新一波
    if (this.enemies.countActive() === 0) {
      this.time.delayedCall(1000, () => {
        this.spawnEnemies();
      });
    }
  }

  update(time, delta) {
    // 检测方向键发射子弹
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.fireBullet('up');
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.fireBullet('down');
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.fireBullet('left');
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.fireBullet('right');
    }

    // 更新信号
    window.__signals__.bulletsActive = this.bullets.countActive();
    window.__signals__.enemiesActive = this.enemies.countActive();

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });
  }
}

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
  scene: GameScene
};

new Phaser.Game(config);