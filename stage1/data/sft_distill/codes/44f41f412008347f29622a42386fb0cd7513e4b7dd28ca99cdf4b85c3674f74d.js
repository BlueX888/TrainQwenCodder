class ShootingGame extends Phaser.Scene {
  constructor() {
    super('ShootingGame');
    this.killCount = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      killCount: 0,
      bulletsActive: 0,
      enemiesActive: 0,
      lastKillTime: 0
    };

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

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.shootBullet(pointer);
      }
    });

    // 监听键盘移动（WASD 或方向键）
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 设置碰撞检测
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
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.killText.setScrollFactor(0);
    this.killText.setDepth(100);

    // 显示提示文本
    this.add.text(400, 50, 'Right Click to Shoot', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 定时生成敌人
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 初始生成几个敌人
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 500, () => this.spawnEnemy());
    }

    // 输出初始日志
    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      killCount: this.killCount
    }));
  }

  update(time, delta) {
    // 玩家移动
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (
        bullet.x < -50 || bullet.x > 850 ||
        bullet.y < -50 || bullet.y > 650
      )) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;
      }
    });

    // 更新信号
    window.__signals__.bulletsActive = this.bullets.countActive(true);
    window.__signals__.enemiesActive = this.enemies.countActive(true);
  }

  shootBullet(pointer) {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 计算子弹方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.worldX,
        pointer.worldY
      );

      // 设置子弹速度
      const speed = 300;
      bullet.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // 输出射击日志
      console.log(JSON.stringify({
        event: 'shoot',
        timestamp: Date.now(),
        position: { x: this.player.x, y: this.player.y },
        target: { x: pointer.worldX, y: pointer.worldY }
      }));
    }
  }

  spawnEnemy() {
    // 随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 300);
    
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(20, 80)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);

    // 输出生成日志
    console.log(JSON.stringify({
      event: 'enemy_spawn',
      timestamp: Date.now(),
      position: { x, y },
      totalEnemies: this.enemies.countActive(true)
    }));
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 更新信号
    window.__signals__.killCount = this.killCount;
    window.__signals__.lastKillTime = Date.now();

    // 输出击杀日志
    console.log(JSON.stringify({
      event: 'enemy_killed',
      timestamp: Date.now(),
      killCount: this.killCount,
      position: { x: enemy.x, y: enemy.y }
    }));

    // 创建击杀特效
    const hitEffect = this.add.graphics();
    hitEffect.fillStyle(0xffffff, 0.8);
    hitEffect.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: hitEffect,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => hitEffect.destroy()
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
  scene: ShootingGame
};

new Phaser.Game(config);