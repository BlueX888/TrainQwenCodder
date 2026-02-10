class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态：发射的子弹总数
    this.activeBullets = 0; // 可验证状态：当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（蓝色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建玩家飞船
    this.player = this.physics.add.sprite(width / 2, height - 80, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹纹理（粉色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff69b4, 1); // 粉色
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture('bullet', 16, 16);
    bulletGraphics.destroy();

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加射击冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 200ms 冷却时间

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加提示文本
    this.add.text(width / 2, 30, 'Press SPACE to Fire', {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  update(time, delta) {
    // 检测空格键发射子弹
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 检查并回收离开边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检测子弹是否离开屏幕边界
        if (bullet.y < -bullet.height || 
            bullet.y > this.cameras.main.height + bullet.height ||
            bullet.x < -bullet.width || 
            bullet.x > this.cameras.main.width + bullet.width) {
          // 回收子弹到对象池
          this.recycleBullet(bullet);
        }
      }
    });

    this.updateStatusText();
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向上发射）
      bullet.body.velocity.y = -360;
      bullet.body.velocity.x = 0;
      
      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.y = 0;
    bullet.body.velocity.x = 0;
    
    // 更新活跃子弹计数
    this.activeBullets--;
  }

  updateStatusText() {
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`,
      `Pool Max: ${this.bullets.maxSize}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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