class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
    this.lastFireTime = 0;
    this.fireDelay = 300; // 发射间隔（毫秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      killCount: 0,
      bulletsFired: 0,
      enemiesActive: 0
    };

    // 创建玩家纹理（蓝色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

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

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建击杀计数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.killText.setScrollFactor(0);
    this.killText.setDepth(100);

    // 创建提示文本
    this.add.text(16, 50, 'Arrow Keys: Fire Bullets', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('Game initialized:', JSON.stringify({
      playerPos: { x: this.player.x, y: this.player.y },
      enemyCount: this.enemies.getLength(),
      killCount: this.killCount
    }));
  }

  spawnEnemies() {
    // 在随机位置生成 8 个敌人
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 确保不在玩家附近生成
      if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) > 100) {
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(-50, 50)
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
      }
    }

    window.__signals__.enemiesActive = this.enemies.getLength();
  }

  fireBullet(direction) {
    const currentTime = this.time.now;
    
    // 检查发射间隔
    if (currentTime - this.lastFireTime < this.fireDelay) {
      return;
    }

    this.lastFireTime = currentTime;

    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (!bullet) {
      return;
    }

    bullet.setActive(true);
    bullet.setVisible(true);

    // 根据方向设置速度
    const speed = 160;
    switch (direction) {
      case 'up':
        bullet.setVelocity(0, -speed);
        break;
      case 'down':
        bullet.setVelocity(0, speed);
        break;
      case 'left':
        bullet.setVelocity(-speed, 0);
        break;
      case 'right':
        bullet.setVelocity(speed, 0);
        break;
    }

    // 子弹超出边界时自动销毁
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
    
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === bullet) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.destroy();
      }
    });

    window.__signals__.bulletsFired++;

    console.log('Bullet fired:', JSON.stringify({
      direction: direction,
      position: { x: bullet.x, y: bullet.y },
      velocity: { x: bullet.body.velocity.x, y: bullet.body.velocity.y },
      totalBulletsFired: window.__signals__.bulletsFired
    }));
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.destroy();

    // 销毁敌人
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 更新 signals
    window.__signals__.killCount = this.killCount;
    window.__signals__.enemiesActive = this.enemies.getLength();

    console.log('Enemy hit:', JSON.stringify({
      killCount: this.killCount,
      enemiesRemaining: this.enemies.getLength(),
      bulletPos: { x: bullet.x, y: bullet.y },
      enemyPos: { x: enemy.x, y: enemy.y }
    }));

    // 如果所有敌人被消灭，生成新的一批
    if (this.enemies.getLength() === 0) {
      console.log('All enemies eliminated! Spawning new wave...');
      this.time.delayedCall(1000, () => {
        this.spawnEnemies();
      });
    }
  }

  update(time, delta) {
    // 检测方向键输入并发射子弹
    if (this.cursors.up.isDown) {
      this.fireBullet('up');
    } else if (this.cursors.down.isDown) {
      this.fireBullet('down');
    } else if (this.cursors.left.isDown) {
      this.fireBullet('left');
    } else if (this.cursors.right.isDown) {
      this.fireBullet('right');
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x || bullet.x > bounds.x + bounds.width ||
            bullet.y < bounds.y || bullet.y > bounds.y + bounds.height) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.destroy();
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

const game = new Phaser.Game(config);