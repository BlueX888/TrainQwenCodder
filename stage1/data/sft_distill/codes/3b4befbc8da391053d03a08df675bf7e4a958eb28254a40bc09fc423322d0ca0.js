class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 可验证的状态信号
  }

  preload() {
    // 创建玩家纹理（三角形飞船）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 20);
    playerGraphics.lineTo(15, 20);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆点）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建敌人纹理（矩形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(-20, -15, 40, 30);
    enemyGraphics.generateTexture('enemy', 40, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy'
    });

    // 生成初始敌人
    this.spawnEnemies(5);

    // 设置键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 子弹发射冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 毫秒

    // 碰撞检测：子弹与敌人
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
      fontFamily: 'Arial'
    });

    // 添加提示文本
    this.add.text(400, 50, 'Press SPACE to shoot', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 80, 'Use Arrow Keys to move', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 敌人简单移动（左右摆动）
    this.enemies.children.entries.forEach(enemy => {
      if (!enemy.moveDirection) {
        enemy.moveDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      }
      enemy.x += enemy.moveDirection * 1;
      
      if (enemy.x <= 50 || enemy.x >= 750) {
        enemy.moveDirection *= -1;
      }
    });

    // 如果敌人数量少于3个，生成新敌人
    if (this.enemies.countActive(true) < 3) {
      this.spawnEnemies(2);
    }
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocityY(-360); // 子弹速度 360
    }
  }

  spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 200);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(0, 0);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 添加简单的击中效果
    const explosion = this.add.circle(enemy.x, enemy.y, 20, 0xffaa00, 0.8);
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
  backgroundColor: '#000033',
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