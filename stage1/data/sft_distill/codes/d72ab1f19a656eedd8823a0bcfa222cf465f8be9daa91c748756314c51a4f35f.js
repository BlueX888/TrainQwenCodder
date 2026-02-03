class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建紫色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池（Physics Group）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        // 初始化子弹属性
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 显示发射计数
    this.bulletText = this.add.text(10, 10, 'Bullets Fired: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示提示信息
    this.add.text(400, 300, 'Click to Fire Bullets', {
      fontSize: '24px',
      fill: '#9932cc'
    }).setOrigin(0.5);
  }

  fireBullet(targetX, targetY) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(400, 300);

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算发射方向
      const angle = Phaser.Math.Angle.Between(400, 300, targetX, targetY);
      
      // 设置速度（速度360）
      const velocityX = Math.cos(angle) * 360;
      const velocityY = Math.sin(angle) * 360;
      
      bullet.setVelocity(velocityX, velocityY);

      // 更新发射计数
      this.bulletsFired++;
      this.bulletText.setText('Bullets Fired: ' + this.bulletsFired);
    }
  }

  update(time, delta) {
    // 检查子弹是否离开边界，回收到对象池
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否超出边界（留一些余量）
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          // 回收子弹
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
      }
    });
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
  scene: BulletScene
};

// 创建游戏实例
new Phaser.Game(config);