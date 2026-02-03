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
    this.spawnEnemies();

    // 设置WASD键
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 设置射击冷却时间
    this.lastFireTime = 0;
    this.fireDelay = 200; // 200ms冷却

    // 添加碰撞检测
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
      fontFamily: 'Arial'
    });
    this.killText.setScrollFactor(0);
    this.killText.setDepth(100);

    // 添加说明文本
    this.add.text(16, 50, 'WASD to shoot', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    // 检测WASD键射击
    if (time > this.lastFireTime + this.fireDelay) {
      if (this.keys.w.isDown) {
        this.fireBullet(0, -1); // 向上
        this.lastFireTime = time;
      } else if (this.keys.s.isDown) {
        this.fireBullet(0, 1); // 向下
        this.lastFireTime = time;
      } else if (this.keys.a.isDown) {
        this.fireBullet(-1, 0); // 向左
        this.lastFireTime = time;
      } else if (this.keys.d.isDown) {
        this.fireBullet(1, 0); // 向右
        this.lastFireTime = time;
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

    // 随机生成新敌人
    if (Phaser.Math.Between(0, 100) < 2 && this.enemies.countActive() < 10) {
      this.spawnEnemy();
    }
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度为160
      bullet.body.velocity.x = dirX * 160;
      bullet.body.velocity.y = dirY * 160;
    }
  }

  spawnEnemies() {
    // 初始生成5个敌人
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    // 随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 确保不在玩家附近生成
    const distance = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
    if (distance < 100) {
      return; // 太近则不生成
    }
    
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);
    
    // 生成新敌人保持数量
    if (this.enemies.countActive() < 3) {
      this.spawnEnemy();
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