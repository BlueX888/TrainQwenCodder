class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shotCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示射击计数
    this.shotText = this.add.text(16, 16, 'Shots: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示控制说明
    this.add.text(16, 50, 'Arrow Keys: Rotate\nWASD: Shoot', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // WASD 射击控制
    if (Phaser.Input.Keyboard.JustDown(this.keys.w)) {
      this.shootBullet(0); // 向前
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.s)) {
      this.shootBullet(180); // 向后
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.a)) {
      this.shootBullet(-90); // 向左
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.d)) {
      this.shootBullet(90); // 向右
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });
  }

  shootBullet(angleOffset) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算射击角度（玩家角度 + 偏移角度）
      const shootAngle = this.player.angle + angleOffset;
      
      // 根据角度设置子弹速度
      const velocity = this.physics.velocityFromAngle(shootAngle, 300);
      bullet.setVelocity(velocity.x, velocity.y);
      bullet.setRotation(Phaser.Math.DegToRad(shootAngle));
      
      // 更新射击计数
      this.shotCount++;
      this.shotText.setText('Shots: ' + this.shotCount);
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