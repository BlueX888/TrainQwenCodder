class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 生成子弹纹理
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
    
    // 生成初始敌人
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

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加发射冷却时间
    this.canShoot = true;
    this.shootCooldown = 250; // 毫秒

    // 添加碰撞检测：子弹与敌人
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
      fontStyle: 'bold'
    });
    this.killText.setDepth(100);

    // 添加说明文本
    this.add.text(16, 50, 'Use Arrow Keys to Shoot', {
      fontSize: '16px',
      fill: '#cccccc'
    });

    // 定时生成新敌人
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    // 检测方向键并发射子弹
    if (this.canShoot) {
      let shootDirection = null;

      if (this.cursors.up.isDown) {
        shootDirection = { x: 0, y: -1 };
      } else if (this.cursors.down.isDown) {
        shootDirection = { x: 0, y: 1 };
      } else if (this.cursors.left.isDown) {
        shootDirection = { x: -1, y: 0 };
      } else if (this.cursors.right.isDown) {
        shootDirection = { x: 1, y: 0 };
      }

      if (shootDirection) {
        this.shootBullet(shootDirection);
        this.canShoot = false;
        
        // 重置发射冷却
        this.time.delayedCall(this.shootCooldown, () => {
          this.canShoot = true;
        });
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          bullet.destroy();
        }
      }
    });
  }

  shootBullet(direction) {
    // 从玩家位置创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度
      const speed = 300;
      bullet.setVelocity(direction.x * speed, direction.y * speed);
      
      // 设置子弹生命周期（3秒后自动销毁）
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);
    
    // 可选：添加视觉反馈
    const explosion = this.add.graphics();
    explosion.fillStyle(0xffa500, 0.8);
    explosion.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => explosion.destroy()
    });
  }

  spawnEnemy() {
    // 在随机位置生成新敌人
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