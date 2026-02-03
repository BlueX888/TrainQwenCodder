class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
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
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成初始敌人
    for (let i = 0; i < 8; i++) {
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

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 用于控制射击间隔
    this.lastFired = 0;
    this.fireDelay = 200; // 200ms 射击间隔

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
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 添加说明文本
    this.add.text(16, 50, 'Arrow Keys: Shoot', {
      fontSize: '16px',
      fill: '#aaa',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    // 检测方向键并发射子弹
    if (time > this.lastFired + this.fireDelay) {
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown) {
        velocityX = -200;
      } else if (this.cursors.right.isDown) {
        velocityX = 200;
      }

      if (this.cursors.up.isDown) {
        velocityY = -200;
      } else if (this.cursors.down.isDown) {
        velocityY = 200;
      }

      // 如果按下了方向键，发射子弹
      if (velocityX !== 0 || velocityY !== 0) {
        this.fireBullet(velocityX, velocityY);
        this.lastFired = time;
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

    // 如果敌人全部被消灭，生成新一波
    if (this.enemies.countActive() === 0) {
      this.spawnEnemies();
    }
  }

  fireBullet(velocityX, velocityY) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocity(velocityX, velocityY);
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹命中敌人
    bullet.destroy();
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);
  }

  spawnEnemies() {
    // 生成新一波敌人
    for (let i = 0; i < 8; i++) {
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