class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
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

    // 设置键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 射击冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 毫秒

    // 设置子弹与敌人的碰撞
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
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.killText.setDepth(100);

    // 添加提示文本
    this.add.text(16, 50, 'Press WASD to shoot', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    // 检测WASD按键发射子弹
    if (time > this.lastFired + this.fireRate) {
      if (this.keys.W.isDown) {
        this.shootBullet(0, -1); // 向上
        this.lastFired = time;
      } else if (this.keys.S.isDown) {
        this.shootBullet(0, 1); // 向下
        this.lastFired = time;
      } else if (this.keys.A.isDown) {
        this.shootBullet(-1, 0); // 向左
        this.lastFired = time;
      } else if (this.keys.D.isDown) {
        this.shootBullet(1, 0); // 向右
        this.lastFired = time;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (
        bullet.x < -50 || bullet.x > 850 ||
        bullet.y < -50 || bullet.y > 650
      )) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 敌人简单移动（随机游荡）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && !enemy.getData('velocity')) {
        const vx = Phaser.Math.Between(-50, 50);
        const vy = Phaser.Math.Between(-50, 50);
        enemy.setVelocity(vx, vy);
        enemy.setData('velocity', true);
      }
    });
  }

  shootBullet(dirX, dirY) {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      
      // 设置子弹速度
      const speed = 300;
      bullet.setVelocity(dirX * speed, dirY * speed);
    }
  }

  spawnEnemies() {
    // 生成8个敌人在随机位置
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 确保不在玩家附近生成
      if (Phaser.Math.Distance.Between(x, y, 400, 300) > 100) {
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
      }
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

    // 如果所有敌人被消灭，重新生成
    if (this.enemies.countActive(true) === 0) {
      this.time.delayedCall(1000, () => {
        this.spawnEnemies();
      });
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