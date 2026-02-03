class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成多个敌人
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加射击冷却时间
    this.lastFireTime = 0;
    this.fireDelay = 250; // 250ms 冷却

    // 显示击杀数
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.killText.setScrollFactor(0);
    this.killText.setDepth(100);

    // 显示操作提示
    this.add.text(16, 560, 'Use Arrow Keys to shoot', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    const currentTime = time;

    // 检测方向键并发射子弹
    if (currentTime - this.lastFireTime > this.fireDelay) {
      let bulletVelocity = null;

      if (this.cursors.left.isDown) {
        bulletVelocity = { x: -120, y: 0 };
      } else if (this.cursors.right.isDown) {
        bulletVelocity = { x: 120, y: 0 };
      } else if (this.cursors.up.isDown) {
        bulletVelocity = { x: 0, y: -120 };
      } else if (this.cursors.down.isDown) {
        bulletVelocity = { x: 0, y: 120 };
      }

      if (bulletVelocity) {
        this.fireBullet(bulletVelocity);
        this.lastFireTime = currentTime;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (
          bullet.x < -10 ||
          bullet.x > 810 ||
          bullet.y < -10 ||
          bullet.y > 610
        ) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 如果所有敌人被消灭，生成新一批
    if (this.enemies.countActive(true) === 0) {
      this.spawnEnemies();
    }
  }

  fireBullet(velocity) {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocity(velocity.x, velocity.y);
      bullet.body.setAllowGravity(false);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 添加击杀特效
    const hitEffect = this.add.graphics();
    hitEffect.fillStyle(0xffffff, 0.8);
    hitEffect.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: hitEffect,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        hitEffect.destroy();
      }
    });
  }

  spawnEnemies() {
    // 生成新一批敌人
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
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