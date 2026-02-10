class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.fireRate = 250; // 发射间隔（毫秒）
    this.nextFire = 0;
    
    // 可验证的状态信号
    this.signals = {
      bulletsFired: 0,
      activeBullets: 0,
      playerAngle: 0,
      playerPosition: { x: 0, y: 0 }
    };
  }

  preload() {
    // 创建玩家纹理（三角形，指向右侧）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 尖端
    playerGraphics.lineTo(-10, -10); // 左下
    playerGraphics.lineTo(-10, 10);  // 右下
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
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
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标左键发射
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet();
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Left/Right: Rotate\nLeft Click: Fire', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 暴露信号到全局
    window.__signals__ = this.signals;

    // 定期输出日志
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        console.log(JSON.stringify(this.signals));
      },
      loop: true
    });
  }

  fireBullet() {
    const time = this.time.now;
    
    // 限制发射速率
    if (time < this.nextFire) {
      return;
    }

    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家当前角度计算速度
      const angle = this.player.angle;
      const radians = Phaser.Math.DegToRad(angle);
      
      const velocityX = Math.cos(radians) * 120;
      const velocityY = Math.sin(radians) * 120;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(radians);
      
      // 设置子弹生命周期（3秒后自动回收）
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
      });

      this.nextFire = time + this.fireRate;
      this.signals.bulletsFired++;
      
      console.log(`Bullet fired at angle: ${angle.toFixed(2)}°, velocity: (${velocityX.toFixed(2)}, ${velocityY.toFixed(2)})`);
    }
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
      }
    });

    // 更新信号
    this.signals.playerAngle = Math.round(this.player.angle);
    this.signals.playerPosition.x = Math.round(this.player.x);
    this.signals.playerPosition.y = Math.round(this.player.y);
    this.signals.activeBullets = this.bullets.countActive(true);

    // 显示实时状态
    const debugText = `Angle: ${this.signals.playerAngle}°\nBullets Fired: ${this.signals.bulletsFired}\nActive: ${this.signals.activeBullets}`;
    
    if (this.debugTextObj) {
      this.debugTextObj.setText(debugText);
    } else {
      this.debugTextObj = this.add.text(10, 60, debugText, {
        fontSize: '14px',
        fill: '#ffff00'
      });
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