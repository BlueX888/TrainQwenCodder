class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数
    this.activeBullets = 0; // 当前活跃子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（红色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建玩家精灵（居中）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池（使用 Physics Group）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet(pointer);
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 550, '右键点击发射子弹', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.updateStatus();
  }

  fireBullet(pointer) {
    // 从对象池获取子弹（如果池中没有可用对象，会自动创建新的）
    const bullet = this.bulletPool.get(this.player.x, this.player.y);

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算从玩家到鼠标的方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // 设置子弹速度（速度240）
      const velocityX = Math.cos(angle) * 240;
      const velocityY = Math.sin(angle) * 240;
      bullet.setVelocity(velocityX, velocityY);

      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
      this.updateStatus();
    }
  }

  update() {
    // 检查所有活跃的子弹
    const bullets = this.bulletPool.getChildren();
    
    bullets.forEach((bullet) => {
      if (bullet.active) {
        // 检查子弹是否离开世界边界
        if (
          bullet.x < -20 ||
          bullet.x > 820 ||
          bullet.y < -20 ||
          bullet.y > 620
        ) {
          // 回收子弹到对象池
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
          
          this.activeBullets--;
          this.updateStatus();
        }
      }
    });
  }

  updateStatus() {
    this.statusText.setText([
      `已发射子弹: ${this.bulletsFired}`,
      `活跃子弹: ${this.activeBullets}`,
      `对象池大小: ${this.bulletPool.getLength()}`
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