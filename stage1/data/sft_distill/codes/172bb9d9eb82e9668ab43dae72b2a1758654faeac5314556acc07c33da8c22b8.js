class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹数量
    this.playerRotation = 0; // 玩家当前旋转角度
  }

  preload() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0); // 尖端
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet();
      }
    });

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 550, 'Left/Right: Rotate | Right Click: Fire', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  fireBullet() {
    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹角度与玩家一致
      bullet.rotation = this.player.rotation;
      
      // 根据玩家角度计算速度
      // 将弧度转换为角度
      const angle = Phaser.Math.RadToDeg(this.player.rotation);
      
      // 使用 velocityFromAngle 设置子弹速度
      this.physics.velocityFromAngle(angle, 300, bullet.body.velocity);
      
      // 子弹飞出屏幕后销毁
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.reset(0, 0);
        }
      });
      
      // 更新状态
      this.bulletsFired++;
    }
  }

  update(time, delta) {
    // 玩家旋转控制
    const rotationSpeed = 3; // 每秒旋转速度（弧度）
    
    if (this.cursors.left.isDown) {
      this.player.rotation -= rotationSpeed * (delta / 1000);
      this.playerRotation = this.player.rotation;
    } else if (this.cursors.right.isDown) {
      this.player.rotation += rotationSpeed * (delta / 1000);
      this.playerRotation = this.player.rotation;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.reset(0, 0);
        }
      }
    });

    // 更新信息显示
    const activeBullets = this.bullets.countActive(true);
    const angle = Phaser.Math.RadToDeg(this.player.rotation).toFixed(0);
    this.infoText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${activeBullets}`,
      `Player Angle: ${angle}°`
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