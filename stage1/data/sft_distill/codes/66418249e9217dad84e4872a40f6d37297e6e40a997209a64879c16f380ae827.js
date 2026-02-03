class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 击杀数状态变量
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
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
    
    // 生成初始敌人（3个）
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
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
    this.bullets = this.physics.add.group();

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.shootBullet(pointer);
      }
    });

    // 设置子弹与敌人的碰撞检测
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

    // 添加提示文本
    this.add.text(16, 50, 'Right Click to Shoot', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });

    // 键盘控制玩家移动
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -10 || bullet.y > 610 || 
          bullet.x < -10 || bullet.x > 810) {
        bullet.destroy();
      }
    });

    // 定期生成新敌人（保持至少3个敌人）
    if (this.enemies.countActive(true) < 3 && Math.random() < 0.02) {
      const x = Phaser.Math.Between(100, 700);
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

  shootBullet(pointer) {
    // 从玩家位置创建子弹
    const bullet = this.bullets.create(
      this.player.x,
      this.player.y,
      'bullet'
    );

    // 计算从玩家到鼠标位置的方向
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 设置子弹速度为 160
    const bulletSpeed = 160;
    this.physics.velocityFromRotation(
      angle,
      bulletSpeed,
      bullet.body.velocity
    );
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 添加击中反馈效果（闪光）
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillCircle(enemy.x, enemy.y, 30);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
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