class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
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
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成初始敌人
    this.spawnEnemies(5);

    // 添加碰撞检测
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
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 初始化可验证信号
    window.__signals__ = {
      killCount: 0,
      bulletsShot: 0,
      enemiesAlive: 5
    };

    // 定时生成新敌人
    this.time.addEvent({
      delay: 3000,
      callback: () => this.spawnEnemies(1),
      loop: true
    });
  }

  spawnEnemies(count) {
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
    
    // 更新信号
    window.__signals__.enemiesAlive = this.enemies.getLength();
  }

  shootBullet(pointer) {
    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算子弹方向（从玩家指向鼠标点击位置）
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // 设置子弹速度（速度为 200）
      this.physics.velocityFromRotation(angle, 200, bullet.body.velocity);

      // 更新信号
      window.__signals__.bulletsShot++;

      // 子弹离开屏幕后销毁
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });

      console.log(JSON.stringify({
        event: 'bullet_shot',
        position: { x: this.player.x, y: this.player.y },
        target: { x: pointer.x, y: pointer.y },
        totalShot: window.__signals__.bulletsShot
      }));
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

    // 更新可验证信号
    window.__signals__.killCount = this.killCount;
    window.__signals__.enemiesAlive = this.enemies.getLength();

    // 输出日志
    console.log(JSON.stringify({
      event: 'enemy_killed',
      killCount: this.killCount,
      enemiesAlive: this.enemies.getLength(),
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 可以添加额外的更新逻辑，例如玩家移动
    const cursors = this.input.keyboard.createCursorKeys();
    
    if (cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
    }
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