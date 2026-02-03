class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.bulletsFired = 0; // 可验证状态：已发射子弹数
    this.activeBullets = 0; // 可验证状态：当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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

    // 创建子弹纹理（圆形）
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
      maxSize: 50,
      runChildUpdate: true
    });

    // 鼠标点击事件 - 发射子弹
    this.input.on('pointerdown', this.shootBullet, this);

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 550, '移动鼠标旋转方向，点击发射子弹', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });
  }

  update(time, delta) {
    // 根据鼠标位置旋转玩家
    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );
    this.player.rotation = angle;

    // 更新活跃子弹数
    this.activeBullets = this.bullets.countActive(true);

    // 检查子弹是否超出边界
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          this.bullets.killAndHide(bullet);
          bullet.body.enable = false;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `发射子弹数: ${this.bulletsFired}`,
      `活跃子弹数: ${this.activeBullets}`,
      `玩家角度: ${Math.round(Phaser.Math.RadToDeg(this.player.rotation))}°`
    ]);
  }

  shootBullet(pointer) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 设置子弹旋转角度与玩家一致
      bullet.rotation = this.player.rotation;

      // 根据玩家朝向计算子弹速度（速度240）
      const velocityX = Math.cos(this.player.rotation) * 240;
      const velocityY = Math.sin(this.player.rotation) * 240;
      
      bullet.body.setVelocity(velocityX, velocityY);

      // 更新发射计数
      this.bulletsFired++;
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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