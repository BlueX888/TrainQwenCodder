class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 使用 Graphics 创建红色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建玩家（用绿色方块表示）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(-20, -20, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组（对象池）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20,
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // 添加提示文本
    this.add.text(10, 10, 'Press SPACE to fire bullets', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffff00'
    });

    // 初始化 signals
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      poolSize: 0
    };

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 检测空格键按下（使用 justDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.fireBullet();
    }

    // 检查子弹是否离开边界
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检查是否离开屏幕边界
        if (
          bullet.y < -20 ||
          bullet.y > this.cameras.main.height + 20 ||
          bullet.x < -20 ||
          bullet.x > this.cameras.main.width + 20
        ) {
          // 回收子弹到对象池
          this.bullets.killAndHide(bullet);
          bullet.body.reset(0, 0);
          
          this.activeBullets--;
          
          console.log(JSON.stringify({
            event: 'bullet_recycled',
            position: { x: bullet.x, y: bullet.y },
            timestamp: Date.now()
          }));
        }
      }
    });

    // 更新统计信息
    this.updateStats();
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向上发射）
      bullet.body.velocity.y = -160;
      bullet.body.velocity.x = 0;
      
      // 更新计数
      this.bulletsFired++;
      this.activeBullets++;
      
      // 记录日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        bulletId: this.bulletsFired,
        position: { x: bullet.x, y: bullet.y },
        velocity: { x: 0, y: -160 },
        timestamp: Date.now()
      }));
      
      // 更新 signals
      window.__signals__.bulletsFired = this.bulletsFired;
      window.__signals__.activeBullets = this.activeBullets;
    } else {
      console.log(JSON.stringify({
        event: 'bullet_pool_exhausted',
        timestamp: Date.now()
      }));
    }
  }

  updateStats() {
    // 更新显示文本
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`,
      `Pool Used: ${this.bullets.countActive(true)}`
    ]);

    // 更新 signals
    window.__signals__.bulletsFired = this.bulletsFired;
    window.__signals__.activeBullets = this.activeBullets;
    window.__signals__.poolSize = this.bullets.getLength();
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
  scene: BulletScene
};

const game = new Phaser.Game(config);