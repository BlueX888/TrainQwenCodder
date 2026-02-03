class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 验证状态信号
    this.playerRotationSpeed = 3; // 旋转速度
  }

  preload() {
    // 创建玩家纹理（三角形指示方向）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.beginPath();
    graphics.moveTo(20, 0);
    graphics.lineTo(-10, -10);
    graphics.lineTo(-10, 10);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('player', 30, 20);
    graphics.destroy();

    // 创建子弹纹理（圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.angle = 0; // 初始朝向右侧

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // 空格键发射子弹（添加延迟防止连发）
    this.lastFireTime = 0;
    this.fireDelay = 200; // 200ms 发射间隔

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 550, 'WASD: 旋转方向 | SPACE: 发射子弹', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });
  }

  update(time, delta) {
    // WASD 控制玩家旋转方向
    if (this.cursors.w.isDown) {
      // W键 - 向上（-90度）
      this.player.angle = -90;
    } else if (this.cursors.s.isDown) {
      // S键 - 向下（90度）
      this.player.angle = 90;
    } else if (this.cursors.a.isDown) {
      // A键 - 向左（180度）
      this.player.angle = 180;
    } else if (this.cursors.d.isDown) {
      // D键 - 向右（0度）
      this.player.angle = 0;
    }

    // 空格键发射子弹
    if (this.cursors.space.isDown && time > this.lastFireTime + this.fireDelay) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `子弹发射数: ${this.bulletsFired}`,
      `玩家角度: ${Math.round(this.player.angle)}°`,
      `活跃子弹: ${this.bullets.countActive(true)}`
    ]);
  }

  fireBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家角度计算子弹速度
      // Phaser角度是顺时针，0度向右
      const velocity = this.physics.velocityFromAngle(
        this.player.angle, 
        160 // 子弹速度
      );
      
      bullet.setVelocity(velocity.x, velocity.y);
      bullet.setRotation(Phaser.Math.DegToRad(this.player.angle));
      
      // 增加发射计数
      this.bulletsFired++;
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