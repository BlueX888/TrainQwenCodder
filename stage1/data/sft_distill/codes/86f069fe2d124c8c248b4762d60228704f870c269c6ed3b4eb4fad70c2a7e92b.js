class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
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
    
    // 生成初始敌人
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
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

    // 设置WASD键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 设置射击冷却时间
    this.lastFireTime = 0;
    this.fireDelay = 200; // 200ms冷却

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
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    this.killText.setScrollFactor(0);

    // 添加提示文本
    this.add.text(16, 560, 'Press WASD to shoot', {
      fontSize: '20px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    const currentTime = time;

    // 检测WASD按键并发射子弹
    if (currentTime - this.lastFireTime > this.fireDelay) {
      if (this.keyW.isDown) {
        this.fireBullet(0, -1); // 向上
        this.lastFireTime = currentTime;
      } else if (this.keyS.isDown) {
        this.fireBullet(0, 1); // 向下
        this.lastFireTime = currentTime;
      } else if (this.keyA.isDown) {
        this.fireBullet(-1, 0); // 向左
        this.lastFireTime = currentTime;
      } else if (this.keyD.isDown) {
        this.fireBullet(1, 0); // 向右
        this.lastFireTime = currentTime;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (
        bullet.x < -50 || bullet.x > 850 ||
        bullet.y < -50 || bullet.y > 650
      )) {
        bullet.destroy();
      }
    });

    // 定期生成新敌人
    if (this.enemies.countActive(true) < 3) {
      this.spawnEnemy();
    }
  }

  fireBullet(dirX, dirY) {
    // 从玩家位置创建子弹
    const bullet = this.bullets.create(
      this.player.x,
      this.player.y,
      'bullet'
    );

    if (bullet) {
      // 设置子弹速度（速度300）
      bullet.setVelocity(dirX * 300, dirY * 300);
      
      // 子弹不受世界边界影响
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

    // 生成新敌人保持游戏持续
    this.time.delayedCall(1000, () => {
      this.spawnEnemy();
    });
  }

  spawnEnemy() {
    // 在随机位置生成敌人
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    const enemy = this.enemies.create(x, y, 'enemy');
    
    if (enemy) {
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }
}

// Phaser游戏配置
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
new Phaser.Game(config);