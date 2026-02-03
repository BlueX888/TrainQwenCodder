class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证的状态信号
    this.activeBullets = 0; // 当前活跃子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bulletTexture', 16, 16);
    graphics.destroy();

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bulletTexture',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 创建玩家位置指示器（用于发射起点）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTexture', 32, 32);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'playerTexture');

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet(pointer);
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加提示文本
    this.add.text(10, 550, '右键点击发射子弹', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    this.updateStatusText();
  }

  fireBullet(pointer) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算从玩家到鼠标位置的方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // 设置子弹速度（速度240）
      const velocityX = Math.cos(angle) * 240;
      const velocityY = Math.sin(angle) * 240;
      bullet.body.setVelocity(velocityX, velocityY);

      // 更新统计信息
      this.bulletsFired++;
      this.activeBullets = this.bullets.countActive(true);
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 检查所有活跃子弹是否离开边界
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否离开屏幕边界
        if (
          bullet.x < -20 ||
          bullet.x > this.cameras.main.width + 20 ||
          bullet.y < -20 ||
          bullet.y > this.cameras.main.height + 20
        ) {
          // 回收子弹到对象池
          this.bullets.killAndHide(bullet);
          bullet.body.reset(0, 0);
          bullet.body.setVelocity(0, 0);
          
          // 更新活跃子弹数
          this.activeBullets = this.bullets.countActive(true);
          this.updateStatusText();
        }
      }
    });
  }

  updateStatusText() {
    this.statusText.setText([
      `已发射子弹: ${this.bulletsFired}`,
      `活跃子弹: ${this.activeBullets}`,
      `对象池大小: ${this.bullets.getLength()}`,
      `对象池已用: ${this.bullets.countActive(true)}/${this.bullets.maxSize}`
    ]);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);