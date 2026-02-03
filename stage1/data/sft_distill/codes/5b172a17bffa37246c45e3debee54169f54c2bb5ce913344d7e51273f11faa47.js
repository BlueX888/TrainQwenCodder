class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.bulletCount = 0; // 可验证状态：发射的子弹总数
    this.activeBullets = 0; // 可验证状态：当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形，指示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 尖端指向右侧
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹物理组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 监听鼠标移动事件，旋转玩家朝向鼠标
    this.input.on('pointermove', (pointer) => {
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );
      this.player.rotation = angle;
    });

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.shootBullet();
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 550, '移动鼠标旋转玩家 | 右键发射子弹', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
  }

  shootBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家旋转角度计算速度向量
      const angle = this.player.rotation;
      const velocityX = Math.cos(angle) * 240;
      const velocityY = Math.sin(angle) * 240;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angle);
      
      // 更新统计
      this.bulletCount++;
      this.activeBullets++;
      
      // 设置子弹生命周期（3秒后自动销毁）
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
          this.activeBullets--;
        }
      });
    }
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `总发射子弹: ${this.bulletCount}`,
      `当前活跃子弹: ${this.activeBullets}`,
      `玩家角度: ${Math.round(Phaser.Math.RadToDeg(this.player.rotation))}°`
    ]);

    // 检查子弹是否超出边界
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (
          bullet.x < bounds.x - 20 ||
          bullet.x > bounds.x + bounds.width + 20 ||
          bullet.y < bounds.y - 20 ||
          bullet.y > bounds.y + bounds.height + 20
        ) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
          this.activeBullets--;
        }
      }
    });
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