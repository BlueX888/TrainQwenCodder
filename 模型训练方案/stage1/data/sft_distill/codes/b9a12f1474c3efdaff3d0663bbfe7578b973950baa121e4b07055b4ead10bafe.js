class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家飞船
    const shipGraphics = this.add.graphics();
    shipGraphics.fillStyle(0x00ff00, 1);
    shipGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    shipGraphics.generateTexture('ship', 30, 35);
    shipGraphics.destroy();

    this.player = this.physics.add.sprite(400, 500, 'ship');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 防止连续发射，添加冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 毫秒

    // 初始化 signals
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      playerX: 400,
      playerY: 500
    };

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      playerPosition: { x: 400, y: 500 }
    }));
  }

  update(time, delta) {
    // 检测空格键发射子弹
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.fireBullet(time);
    }

    // 检查并回收超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.y < -10 || bullet.y > 610 || bullet.x < -10 || bullet.x > 810) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新活跃子弹数量
    this.activeBullets = this.bullets.countActive(true);

    // 更新 signals
    window.__signals__.bulletsFired = this.bulletsFired;
    window.__signals__.activeBullets = this.activeBullets;
    window.__signals__.playerX = this.player.x;
    window.__signals__.playerY = this.player.y;

    // 更新状态文本
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`,
      `Press SPACE to fire`
    ]);
  }

  fireBullet(time) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向上发射）
      bullet.body.velocity.y = -160;
      bullet.body.velocity.x = 0;

      this.lastFired = time;
      this.bulletsFired++;

      console.log(JSON.stringify({
        event: 'bullet_fired',
        timestamp: Date.now(),
        bulletId: this.bulletsFired,
        position: { x: bullet.x, y: bullet.y },
        velocity: { x: 0, y: -160 }
      }));
    }
  }

  recycleBullet(bullet) {
    console.log(JSON.stringify({
      event: 'bullet_recycled',
      timestamp: Date.now(),
      position: { x: bullet.x, y: bullet.y }
    }));

    // 回收到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.set(0, 0);
    bullet.setPosition(-100, -100); // 移到屏幕外
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
  scene: BulletScene
};

const game = new Phaser.Game(config);