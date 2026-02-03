class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
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
    for (let i = 0; i < 8; i++) {
      this.spawnEnemy();
    }

    // 定时生成敌人
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (this.enemies.getChildren().length < 15) {
          this.spawnEnemy();
        }
      },
      loop: true
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 设置射击冷却
    this.canShoot = true;
    this.shootDelay = 250; // 毫秒

    // 子弹与敌人碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.bulletHitEnemy,
      null,
      this
    );

    // 显示击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.killText.setDepth(100);

    // 显示控制提示
    this.add.text(16, 50, 'WASD: Shoot', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    // 检测 WASD 键发射子弹
    if (this.canShoot) {
      if (this.keys.W.isDown) {
        this.shootBullet(0, -1); // 向上
      } else if (this.keys.S.isDown) {
        this.shootBullet(0, 1); // 向下
      } else if (this.keys.A.isDown) {
        this.shootBullet(-1, 0); // 向左
      } else if (this.keys.D.isDown) {
        this.shootBullet(1, 0); // 向右
      }
    }

    // 清理超出边界的子弹
    this.bullets.getChildren().forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x - 50 || bullet.x > bounds.right + 50 ||
            bullet.y < bounds.y - 50 || bullet.y > bounds.bottom + 50) {
          bullet.destroy();
        }
      }
    });

    // 敌人随机移动
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active && Math.random() < 0.02) {
        const angle = Math.random() * Math.PI * 2;
        enemy.setVelocity(
          Math.cos(angle) * 50,
          Math.sin(angle) * 50
        );
      }
    });
  }

  shootBullet(dirX, dirY) {
    // 设置射击冷却
    this.canShoot = false;
    this.time.delayedCall(this.shootDelay, () => {
      this.canShoot = true;
    });

    // 创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度
      const speed = 400;
      bullet.body.velocity.x = dirX * speed;
      bullet.body.velocity.y = dirY * speed;

      // 子弹存活时间
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
  }

  spawnEnemy() {
    // 随机位置生成敌人（避开中心区域）
    let x, y;
    do {
      x = Phaser.Math.Between(50, 750);
      y = Phaser.Math.Between(50, 550);
    } while (
      Math.abs(x - this.player.x) < 150 &&
      Math.abs(y - this.player.y) < 150
    );

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    
    // 设置随机初始速度
    const angle = Math.random() * Math.PI * 2;
    enemy.setVelocity(
      Math.cos(angle) * 50,
      Math.sin(angle) * 50
    );
  }

  bulletHitEnemy(bullet, enemy) {
    // 子弹击中敌人
    bullet.destroy();
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 添加击杀特效
    const flash = this.add.graphics();
    flash.fillStyle(0xffff00, 0.6);
    flash.fillCircle(enemy.x, enemy.y, 30);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
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

// 创建游戏实例
const game = new Phaser.Game(config);