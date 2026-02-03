class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 创建玩家纹理（蓝色三角形飞船）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成初始敌人（5个）
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 250);
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
      maxSize: 30
    });

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      this.fireBullet(pointer);
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
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 添加提示文本
    this.add.text(400, 550, 'Click to shoot!', {
      fontSize: '18px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 定时生成新敌人
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  fireBullet(pointer) {
    // 从玩家位置发射子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算从玩家到鼠标点击位置的方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // 设置子弹速度（速度240）
      this.physics.velocityFromRotation(angle, 240, bullet.body.velocity);

      // 子弹超出屏幕后自动销毁
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹命中敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 添加击中特效（白色闪光）
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(enemy.x, enemy.y, 20);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
  }

  spawnEnemy() {
    // 随机生成新敌人
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 250);
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
  }

  update(time, delta) {
    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (
        bullet.x < -10 || bullet.x > 810 ||
        bullet.y < -10 || bullet.y > 610
      )) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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