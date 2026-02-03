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

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成初始敌人
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 300);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 设置碰撞检测
    this.physics.add.collider(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 记录上次发射时间
    this.lastFired = 0;
    this.fireRate = 250; // 发射间隔（毫秒）

    // 显示击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.killText.setDepth(100);

    // 添加提示文本
    this.add.text(400, 550, 'Use Arrow Keys to Shoot', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 玩家移动（可选，使用 WASD）
    const speed = 200;
    this.player.setVelocity(0);

    if (this.input.keyboard.addKey('W').isDown) {
      this.player.setVelocityY(-speed);
    }
    if (this.input.keyboard.addKey('S').isDown) {
      this.player.setVelocityY(speed);
    }
    if (this.input.keyboard.addKey('A').isDown) {
      this.player.setVelocityX(-speed);
    }
    if (this.input.keyboard.addKey('D').isDown) {
      this.player.setVelocityX(speed);
    }

    // 方向键发射子弹
    if (time > this.lastFired) {
      let fireDirection = null;
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.up.isDown) {
        fireDirection = 'up';
        velocityY = -200;
      } else if (this.cursors.down.isDown) {
        fireDirection = 'down';
        velocityY = 200;
      } else if (this.cursors.left.isDown) {
        fireDirection = 'left';
        velocityX = -200;
      } else if (this.cursors.right.isDown) {
        fireDirection = 'right';
        velocityX = 200;
      }

      if (fireDirection) {
        this.fireBullet(velocityX, velocityY);
        this.lastFired = time + this.fireRate;
      }
    }

    // 清理屏幕外的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 如果敌人全部被消灭，生成新的一波
    if (this.enemies.countActive(true) === 0) {
      this.spawnEnemyWave();
    }
  }

  fireBullet(velocityX, velocityY) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocity(velocityX, velocityY);
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹命中敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 创建击中特效
    const hitEffect = this.add.graphics();
    hitEffect.fillStyle(0xffffff, 0.8);
    hitEffect.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: hitEffect,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 200,
      onComplete: () => {
        hitEffect.destroy();
      }
    });
  }

  spawnEnemyWave() {
    // 生成新一波敌人
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 300);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
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

// 可验证的状态信号（通过场景访问）
// game.scene.scenes[0].killCount - 当前击杀数