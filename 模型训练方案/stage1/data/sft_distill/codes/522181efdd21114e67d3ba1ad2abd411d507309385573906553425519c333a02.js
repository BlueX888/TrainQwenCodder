class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
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

    // 生成初始敌人
    this.spawnEnemies(5);

    // 设置键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 防止连续发射的冷却时间
    this.lastFireTime = 0;
    this.fireDelay = 200; // 200ms冷却

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
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.killText.setScrollFactor(0);
    this.killText.setDepth(100);

    // 添加提示文本
    this.add.text(16, 50, 'Press WASD to shoot', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    const currentTime = time;

    // 检测WASD键发射子弹
    if (currentTime - this.lastFireTime > this.fireDelay) {
      if (this.keys.W.isDown) {
        this.shootBullet(0, -1); // 向上
        this.lastFireTime = currentTime;
      } else if (this.keys.S.isDown) {
        this.shootBullet(0, 1); // 向下
        this.lastFireTime = currentTime;
      } else if (this.keys.A.isDown) {
        this.shootBullet(-1, 0); // 向左
        this.lastFireTime = currentTime;
      } else if (this.keys.D.isDown) {
        this.shootBullet(1, 0); // 向右
        this.lastFireTime = currentTime;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x || bullet.x > bounds.right ||
            bullet.y < bounds.y || bullet.y > bounds.bottom) {
          bullet.destroy();
        }
      }
    });

    // 当敌人数量少于3个时补充
    if (this.enemies.countActive(true) < 3) {
      this.spawnEnemies(2);
    }
  }

  shootBullet(dirX, dirY) {
    // 从玩家位置创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度为200
      bullet.body.velocity.x = dirX * 200;
      bullet.body.velocity.y = dirY * 200;
      
      // 设置子弹不受世界边界限制
      bullet.setCollideWorldBounds(false);
    }
  }

  spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
      // 随机位置生成敌人，避免与玩家重叠
      let x, y;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 100);

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 给敌人随机速度
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹命中敌人
    bullet.destroy();
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);
    
    // 可选：添加视觉反馈
    const explosion = this.add.circle(enemy.x, enemy.y, 20, 0xffffff, 0.8);
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => explosion.destroy()
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

new Phaser.Game(config);