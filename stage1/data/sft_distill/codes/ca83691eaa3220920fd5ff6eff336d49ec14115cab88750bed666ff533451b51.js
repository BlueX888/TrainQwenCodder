class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(3, 3, 3);
    bulletGraphics.generateTexture('bullet', 6, 6);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
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

    // 定时生成敌人
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true
    });

    // 监听鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      this.shootBullet(pointer);
    });

    // 设置子弹与敌人的碰撞检测
    this.physics.add.collider(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 创建击杀计数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 添加键盘控制（可选，用于移动玩家）
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
      }
    });
  }

  shootBullet(pointer) {
    // 从玩家位置发射子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 计算子弹方向（从玩家指向鼠标点击位置）
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // 设置子弹速度（速度为 300）
      this.physics.velocityFromRotation(angle, 300, bullet.body.velocity);

      // 旋转子弹朝向
      bullet.rotation = angle;
    }
  }

  spawnEnemies() {
    // 随机生成 1-3 个敌人
    const count = Phaser.Math.Between(1, 3);
    
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(50, 750);
      const enemy = this.enemies.create(x, -30, 'enemy');
      
      if (enemy) {
        enemy.setVelocityY(Phaser.Math.Between(50, 150));
      }
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 添加击中效果
    const explosion = this.add.graphics();
    explosion.fillStyle(0xffffff, 1);
    explosion.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => {
        explosion.destroy();
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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