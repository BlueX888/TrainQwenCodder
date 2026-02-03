class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
    this.lastFireTime = 0;
    this.fireRate = 300; // 发射间隔（毫秒）
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
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

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成初始敌人（8个随机位置）
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
      maxSize: 20
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

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
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    });
    this.killText.setDepth(100);

    // 显示操作提示
    this.add.text(16, 560, 'Use Arrow Keys to Shoot', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    // 检测方向键并发射子弹
    if (time > this.lastFireTime + this.fireRate) {
      let velocityX = 0;
      let velocityY = 0;
      let shouldFire = false;

      if (this.cursors.left.isDown) {
        velocityX = -120;
        shouldFire = true;
      } else if (this.cursors.right.isDown) {
        velocityX = 120;
        shouldFire = true;
      }

      if (this.cursors.up.isDown) {
        velocityY = -120;
        shouldFire = true;
      } else if (this.cursors.down.isDown) {
        velocityY = 120;
        shouldFire = true;
      }

      // 支持斜向射击（同时按两个方向键）
      if (shouldFire) {
        this.fireBullet(velocityX, velocityY);
        this.lastFireTime = time;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 当敌人全部被消灭时，生成新一波
    if (this.enemies.countActive(true) === 0) {
      this.spawnNewWave();
    }
  }

  fireBullet(velocityX, velocityY) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocity(velocityX, velocityY);
      bullet.body.setAllowGravity(false);
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹命中敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);
    
    // 简单的视觉反馈（闪烁效果）
    this.cameras.main.flash(100, 255, 255, 255, false, 0.1);
  }

  spawnNewWave() {
    // 生成新一波敌人（数量递增）
    const enemyCount = Math.min(8 + Math.floor(this.killCount / 8), 20);
    
    for (let i = 0; i < enemyCount; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 确保不在玩家附近生成
      if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) > 100) {
        const enemy = this.enemies.create(x, y, 'enemy');
        const speed = Phaser.Math.Between(30, 80);
        enemy.setVelocity(
          Phaser.Math.Between(-speed, speed),
          Phaser.Math.Between(-speed, speed)
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
      }
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