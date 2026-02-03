class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数
    this.rotationSpeed = 3; // 旋转速度（度/帧）
    this.bulletSpeed = 120; // 子弹速度
    this.fireRate = 250; // 发射间隔（毫秒）
    this.lastFired = 0; // 上次发射时间
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0); // 前端
    playerGraphics.lineTo(-10, -10); // 左后
    playerGraphics.lineTo(-10, 10); // 右后
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(3, 3, 3);
    bulletGraphics.generateTexture('bullet', 6, 6);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = {
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制说明
    this.add.text(10, 550, 'Controls: A/D - Rotate | Arrow Keys - Fire | SPACE - Fire Forward', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    // 子弹离开屏幕时销毁
    this.bullets.children.iterate = function(child) {
      if (child && child.active) {
        if (child.x < -50 || child.x > 850 || child.y < -50 || child.y > 650) {
          child.setActive(false);
          child.setVisible(false);
        }
      }
    };
  }

  update(time, delta) {
    // 旋转控制
    if (this.keys.a.isDown) {
      this.player.angle -= this.rotationSpeed;
    }
    if (this.keys.d.isDown) {
      this.player.angle += this.rotationSpeed;
    }

    // 方向键射击
    let fireAngle = null;
    
    if (this.cursors.up.isDown) {
      fireAngle = this.player.angle - 90; // 向上
    } else if (this.cursors.down.isDown) {
      fireAngle = this.player.angle + 90; // 向下
    } else if (this.cursors.left.isDown) {
      fireAngle = this.player.angle + 180; // 向左
    } else if (this.cursors.right.isDown) {
      fireAngle = this.player.angle; // 向右（当前朝向）
    } else if (this.keys.space.isDown) {
      fireAngle = this.player.angle; // 空格键：当前朝向
    }

    // 发射子弹
    if (fireAngle !== null && time > this.lastFired + this.fireRate) {
      this.fireBullet(fireAngle);
      this.lastFired = time;
    }

    // 清理屏幕外的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  fireBullet(angle) {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算子弹速度向量
      const angleRad = Phaser.Math.DegToRad(angle);
      const velocityX = Math.cos(angleRad) * this.bulletSpeed;
      const velocityY = Math.sin(angleRad) * this.bulletSpeed;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angleRad);
      
      // 增加发射计数
      this.bulletsFired++;
    }
  }

  updateStatus() {
    const activeBullets = this.bullets.countActive(true);
    this.statusText.setText(
      `Bullets Fired: ${this.bulletsFired}\n` +
      `Active Bullets: ${activeBullets}\n` +
      `Player Angle: ${Math.round(this.player.angle)}°`
    );
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
  scene: ShootingScene
};

new Phaser.Game(config);