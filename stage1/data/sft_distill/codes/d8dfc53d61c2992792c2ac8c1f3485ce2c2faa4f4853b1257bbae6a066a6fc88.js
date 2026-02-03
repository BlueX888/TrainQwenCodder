class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
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
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加射击冷却时间
    this.lastShootTime = 0;
    this.shootDelay = 200; // 毫秒

    // 碰撞检测：子弹与敌人
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
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.killText.setScrollFactor(0);

    // 显示控制提示
    this.add.text(16, 560, 'WASD: Shoot in 4 directions', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 检测WASD射击
    const currentTime = time;
    if (currentTime - this.lastShootTime > this.shootDelay) {
      if (this.keyW.isDown) {
        this.shootBullet(0, -1); // 向上
        this.lastShootTime = currentTime;
      } else if (this.keyS.isDown) {
        this.shootBullet(0, 1); // 向下
        this.lastShootTime = currentTime;
      } else if (this.keyA.isDown) {
        this.shootBullet(-1, 0); // 向左
        this.lastShootTime = currentTime;
      } else if (this.keyD.isDown) {
        this.shootBullet(1, 0); // 向右
        this.lastShootTime = currentTime;
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

    // 敌人简单移动（可选，增加难度）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
          enemy.setVelocity(
            (dx / distance) * 50,
            (dy / distance) * 50
          );
        }
      }
    });
  }

  shootBullet(dirX, dirY) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度为360
      const speed = 360;
      bullet.setVelocity(dirX * speed, dirY * speed);
      
      // 设置子弹生命周期
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
  }

  bulletHitEnemy(bullet, enemy) {
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

  spawnEnemies() {
    // 初始生成5个敌人
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    // 随机位置生成敌人（避免在玩家附近）
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