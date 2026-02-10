class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数
  }

  preload() {
    // 创建玩家纹理（三角形，指示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 顶点（前方）
    playerGraphics.lineTo(-10, -10); // 左后
    playerGraphics.lineTo(-10, 10);  // 右后
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
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 空格键发射子弹
    this.spaceKey.on('down', () => {
      this.shootBullet();
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 550, 'Left/Right: Rotate | Space: Shoot', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });

    this.updateStatusText();
  }

  shootBullet() {
    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家朝向计算子弹速度
      const angle = this.player.angle;
      const velocity = this.physics.velocityFromAngle(angle, 400);
      
      bullet.setVelocity(velocity.x, velocity.y);
      bullet.setRotation(Phaser.Math.DegToRad(angle));
      
      // 设置子弹生命周期（3秒后自动回收）
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          this.bullets.killAndHide(bullet);
        }
      });

      this.bulletsFired++;
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 玩家移动（可选：添加前进/后退）
    if (this.cursors.up.isDown) {
      const velocity = this.physics.velocityFromAngle(this.player.angle, 200);
      this.player.setVelocity(velocity.x, velocity.y);
    }

    // 检查子弹是否超出边界
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          this.bullets.killAndHide(bullet);
        }
      }
    });
  }

  updateStatusText() {
    this.statusText.setText(
      `Bullets Fired: ${this.bulletsFired}\n` +
      `Active Bullets: ${this.bullets.countActive(true)}\n` +
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
  scene: GameScene
};

new Phaser.Game(config);