class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证状态信号
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
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
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 200);
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

    // 添加碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 显示击杀数
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 添加射击冷却
    this.lastShotTime = 0;
    this.shootDelay = 250; // 毫秒
  }

  update(time, delta) {
    // 检测方向键并发射子弹
    if (time > this.lastShotTime + this.shootDelay) {
      if (this.cursors.left.isDown) {
        this.shootBullet(-1, 0);
        this.lastShotTime = time;
      } else if (this.cursors.right.isDown) {
        this.shootBullet(1, 0);
        this.lastShotTime = time;
      } else if (this.cursors.up.isDown) {
        this.shootBullet(0, -1);
        this.lastShotTime = time;
      } else if (this.cursors.down.isDown) {
        this.shootBullet(0, 1);
        this.lastShotTime = time;
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

    // 自动生成新敌人
    if (this.enemies.countActive(true) < 3) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 200);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  shootBullet(dirX, dirY) {
    // 创建子弹
    const bullet = this.bullets.create(
      this.player.x,
      this.player.y,
      'bullet'
    );

    if (bullet) {
      // 设置子弹速度（速度 240）
      bullet.setVelocity(dirX * 240, dirY * 240);
      
      // 设置子弹不受世界边界影响
      bullet.setCollideWorldBounds(false);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 添加击杀特效（可选）
    const explosion = this.add.graphics();
    explosion.fillStyle(0xffffff, 0.8);
    explosion.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);