class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证的状态信号
    this.rotationSpeed = 3; // 旋转速度（度/帧）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0); // 尖端指向右侧（0度方向）
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理
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

    // 设置键盘输入
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // 空格键发射子弹（使用justDown避免连续触发）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.fireBullet();
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 处理旋转
    if (this.keys.a.isDown) {
      this.player.angle -= this.rotationSpeed;
    }
    if (this.keys.d.isDown) {
      this.player.angle += this.rotationSpeed;
    }

    // WASD也可以控制朝向（W向上，S向下）
    if (this.keys.w.isDown) {
      this.player.angle = -90; // 向上
    }
    if (this.keys.s.isDown) {
      this.player.angle = 90; // 向下
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家当前角度计算子弹速度
      // Phaser角度：0度向右，90度向下，-90度向上
      const speed = 300;
      const velocity = this.physics.velocityFromAngle(
        this.player.angle, 
        speed
      );
      
      bullet.setVelocity(velocity.x, velocity.y);
      bullet.setRotation(Phaser.Math.DegToRad(this.player.angle));
      
      // 更新状态
      this.bulletsFired++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Player Angle: ${Math.round(this.player.angle)}°`,
      '',
      'Controls:',
      'A/D - Rotate',
      'W/S - Face Up/Down',
      'SPACE - Fire'
    ]);
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