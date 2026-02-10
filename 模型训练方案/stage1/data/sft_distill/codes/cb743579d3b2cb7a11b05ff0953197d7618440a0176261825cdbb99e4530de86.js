class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
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
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成初始敌人
    for (let i = 0; i < 5; i++) {
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

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 设置子弹与敌人的碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 监听鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      this.shootBullet(pointer.x, pointer.y);
    });

    // 显示击杀数
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    });

    // 添加提示文本
    this.add.text(400, 560, 'Click to shoot!', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  shootBullet(targetX, targetY) {
    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算从玩家到鼠标的方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        targetX,
        targetY
      );

      // 设置子弹速度（速度240）
      const velocityX = Math.cos(angle) * 240;
      const velocityY = Math.sin(angle) * 240;
      
      bullet.setVelocity(velocityX, velocityY);

      // 子弹超出边界时自动回收
      bullet.setCollideWorldBounds(true);
      bullet.body.onWorldBounds = true;
      
      this.physics.world.on('worldbounds', (body) => {
        if (body.gameObject === bullet) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.stop();
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();
    
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 如果敌人全部被消灭，生成新一波敌人
    if (this.enemies.countActive() === 0) {
      this.spawnNewWave();
    }
  }

  spawnNewWave() {
    // 生成新一波敌人（数量递增）
    const enemyCount = Math.min(5 + Math.floor(this.killCount / 5), 10);
    
    for (let i = 0; i < enemyCount; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 300);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 敌人速度随波数增加
      const speed = 100 + Math.floor(this.killCount / 5) * 20;
      enemy.setVelocity(
        Phaser.Math.Between(-speed, speed),
        Phaser.Math.Between(-speed, speed)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  update(time, delta) {
    // 清理超出边界或不活跃的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x || bullet.x > bounds.right ||
            bullet.y < bounds.y || bullet.y > bounds.bottom) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.stop();
        }
      }
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