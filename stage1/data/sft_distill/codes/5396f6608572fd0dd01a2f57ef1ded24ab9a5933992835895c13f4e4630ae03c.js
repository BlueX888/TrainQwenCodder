class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 使用 Graphics 创建子弹纹理，无需外部资源
  }

  create() {
    // 创建红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8); // 半径8的圆形
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建玩家（用于发射子弹的起点）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池（Physics Group）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 初始化 signals
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      poolSize: 20,
      timestamp: Date.now()
    };

    // 添加提示文本
    this.add.text(10, 10, 'Press SPACE to fire bullets', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffff00'
    });
  }

  update(time, delta) {
    // 检测空格键按下（使用 JustDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.fireBullet();
    }

    // 检查子弹是否离开边界并回收
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检测是否离开屏幕边界
        if (bullet.y < -20 || bullet.y > this.cameras.main.height + 20 ||
            bullet.x < -20 || bullet.x > this.cameras.main.width + 20) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新统计信息
    this.activeBullets = this.bullets.countActive(true);
    this.statsText.setText(
      `Bullets Fired: ${this.bulletsFired}\n` +
      `Active Bullets: ${this.activeBullets}\n` +
      `Pool Available: ${this.bullets.maxSize - this.activeBullets}`
    );

    // 更新 signals
    window.__signals__.bulletsFired = this.bulletsFired;
    window.__signals__.activeBullets = this.activeBullets;
    window.__signals__.timestamp = Date.now();
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向上发射）
      bullet.body.setVelocity(0, -160);
      
      // 记录发射次数
      this.bulletsFired++;
      
      // 输出日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        bulletsFired: this.bulletsFired,
        activeBullets: this.bullets.countActive(true),
        timestamp: Date.now()
      }));
    } else {
      console.log(JSON.stringify({
        event: 'bullet_pool_full',
        maxSize: this.bullets.maxSize,
        timestamp: Date.now()
      }));
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    
    console.log(JSON.stringify({
      event: 'bullet_recycled',
      activeBullets: this.bullets.countActive(true),
      timestamp: Date.now()
    }));
  }
}

// 游戏配置
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
  scene: BulletScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局 signals
window.__signals__ = {
  bulletsFired: 0,
  activeBullets: 0,
  poolSize: 20,
  timestamp: Date.now()
};