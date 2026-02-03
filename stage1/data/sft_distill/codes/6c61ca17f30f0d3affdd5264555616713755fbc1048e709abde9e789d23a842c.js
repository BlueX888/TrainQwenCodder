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
    // 创建粉色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(8, 8, 8); // 半径8的圆形
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池（物理组）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        // 设置子弹属性
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.setAllowGravity(false);
        bullet.body.onWorldBounds = true;
      }
    });

    // 监听子弹离开世界边界事件
    this.physics.world.on('worldbounds', (body) => {
      // 检查是否是子弹
      if (this.bullets.contains(body.gameObject)) {
        this.recycleBullet(body.gameObject);
      }
    });

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click to fire bullets', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#00ff00'
    });

    // 初始化信号对象
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      poolSize: 0
    };

    this.updateStats();
  }

  fireBullet(x, y) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(x, y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 启用世界边界检测
      bullet.body.setCollideWorldBounds(false);
      bullet.body.onWorldBounds = true;
      
      // 设置子弹速度（向右发射）
      bullet.body.setVelocity(240, 0);
      
      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
      this.updateStats();
      
      // 输出日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        position: { x, y },
        totalFired: this.bulletsFired,
        active: this.activeBullets
      }));
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    
    // 更新统计
    this.activeBullets--;
    this.updateStats();
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'bullet_recycled',
      active: this.activeBullets,
      poolSize: this.bullets.getLength()
    }));
  }

  updateStats() {
    // 更新显示文本
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`
    ]);

    // 更新全局信号
    window.__signals__ = {
      bulletsFired: this.bulletsFired,
      activeBullets: this.activeBullets,
      poolSize: this.bullets.getLength()
    };
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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