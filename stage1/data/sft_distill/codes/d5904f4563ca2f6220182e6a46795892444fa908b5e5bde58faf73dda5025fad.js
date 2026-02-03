class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shotsFired = 0; // 状态信号：发射子弹数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形飞船）
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
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标左键射击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.shootBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 550, 'Controls: Arrow Keys to Rotate | Left Click to Shoot', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });
  }

  shootBullet() {
    // 从子弹组获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹角度与玩家一致
      bullet.setRotation(this.player.rotation);
      
      // 根据玩家角度计算速度（角度转为度数）
      const angleInDegrees = Phaser.Math.RadToDeg(this.player.rotation);
      const velocity = this.physics.velocityFromAngle(angleInDegrees, 360);
      
      bullet.setVelocity(velocity.x, velocity.y);
      
      // 子弹生命周期管理
      bullet.lifespan = 3000; // 3秒后销毁
      bullet.spawnTime = this.time.now;
      
      // 更新状态
      this.shotsFired++;
    }
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 可选：上下键移动（增强体验）
    if (this.cursors.up.isDown) {
      const angleInDegrees = Phaser.Math.RadToDeg(this.player.rotation);
      const velocity = this.physics.velocityFromAngle(angleInDegrees, 200);
      this.player.setVelocity(velocity.x, velocity.y);
    }

    // 子弹生命周期管理
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检查子弹是否超出边界
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
        
        // 检查子弹是否超时
        if (time - bullet.spawnTime > bullet.lifespan) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新状态显示
    const activeBullets = this.bullets.countActive(true);
    this.statusText.setText([
      `Shots Fired: ${this.shotsFired}`,
      `Active Bullets: ${activeBullets}`,
      `Player Angle: ${Math.round(this.player.angle)}°`
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