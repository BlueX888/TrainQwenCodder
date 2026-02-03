class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示方向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 尖端指向右侧
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
    this.player.setDrag(500);
    this.player.setMaxVelocity(300);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 鼠标输入
    this.input.on('pointermove', (pointer) => {
      // 计算玩家到鼠标的角度
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );
      this.player.rotation = angle;
    });

    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 550, 'WASD/方向键移动 | 鼠标移动旋转 | 左键射击', {
      fontSize: '14px',
      fill: '#00ff00'
    });
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹角度和速度
      bullet.rotation = this.player.rotation;
      
      // 使用velocityFromAngle设置速度为360
      const angle = Phaser.Math.RadToDeg(this.player.rotation);
      this.physics.velocityFromAngle(angle, 360, bullet.body.velocity);
      
      // 设置子弹生命周期
      bullet.lifespan = 2000; // 2秒后消失
      bullet.birthTime = this.time.now;
      
      this.bulletsFired++;
    }
  }

  update(time, delta) {
    // 玩家移动控制
    const acceleration = 400;
    
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 更新子弹状态
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检查子弹是否超时
        if (time - bullet.birthTime > bullet.lifespan) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
        
        // 检查子弹是否超出边界
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新状态显示
    const activeBullets = this.bullets.countActive(true);
    this.statusText.setText([
      `子弹发射总数: ${this.bulletsFired}`,
      `当前活跃子弹: ${activeBullets}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `玩家角度: ${Math.round(Phaser.Math.RadToDeg(this.player.rotation))}°`
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