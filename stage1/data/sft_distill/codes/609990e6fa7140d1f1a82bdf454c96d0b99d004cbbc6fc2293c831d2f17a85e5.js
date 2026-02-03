class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.bulletsFired = 0; // 可验证状态信号
    this.activeBullets = 0; // 当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形指示方向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 顶点（指向右侧）
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆点）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // 射击冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 毫秒

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 550, 'WASD: 旋转方向 | SPACE: 发射子弹', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });
  }

  update(time, delta) {
    // 玩家旋转控制
    const rotationSpeed = 3; // 度/帧

    if (this.keys.w.isDown) {
      this.player.angle = -90; // 向上
    } else if (this.keys.s.isDown) {
      this.player.angle = 90; // 向下
    } else if (this.keys.a.isDown) {
      this.player.angle = 180; // 向左
    } else if (this.keys.d.isDown) {
      this.player.angle = 0; // 向右
    }

    // 发射子弹
    if (this.keys.space.isDown && time > this.lastFired + this.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 更新子弹，移除超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeBullets--;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `子弹发射次数: ${this.bulletsFired}`,
      `当前活跃子弹: ${this.activeBullets}`,
      `玩家角度: ${Math.round(this.player.angle)}°`
    ]);
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家角度计算子弹速度
      const angleRad = Phaser.Math.DegToRad(this.player.angle);
      const velocityX = Math.cos(angleRad) * 360;
      const velocityY = Math.sin(angleRad) * 360;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angleRad);
      
      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: ShootingScene
};

new Phaser.Game(config);