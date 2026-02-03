class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹总数
    this.activeBullets = 0; // 状态信号：当前活跃的子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色
    graphics.fillCircle(8, 8, 8); // 圆心(8,8)，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池（Physics Group）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 启用右键菜单禁用（可选，防止右键弹出菜单）
    this.input.mouse.disableContextMenu();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加提示文本
    this.add.text(400, 300, '右键点击发射红色子弹', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
  }

  fireBullet(x, y) {
    // 从对象池获取或创建子弹
    const bullet = this.bulletPool.get(x, y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算从屏幕中心到点击位置的方向
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      const angle = Phaser.Math.Angle.Between(centerX, centerY, x, y);
      
      // 设置子弹速度（速度240）
      this.physics.velocityFromRotation(angle, 240, bullet.body.velocity);

      // 更新状态
      this.bulletsFired++;
      this.activeBullets++;
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 检查所有活跃的子弹
    const bullets = this.bulletPool.getChildren();
    
    bullets.forEach((bullet) => {
      if (bullet.active) {
        // 检查子弹是否离开边界
        if (this.isOutOfBounds(bullet)) {
          this.recycleBullet(bullet);
        }
      }
    });
  }

  isOutOfBounds(bullet) {
    const bounds = 50; // 边界缓冲区
    return (
      bullet.x < -bounds ||
      bullet.x > this.cameras.main.width + bounds ||
      bullet.y < -bounds ||
      bullet.y > this.cameras.main.height + bounds
    );
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.set(0, 0);
    
    // 更新状态
    this.activeBullets--;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText(
      `发射总数: ${this.bulletsFired}\n` +
      `活跃子弹: ${this.activeBullets}\n` +
      `对象池大小: ${this.bulletPool.getLength()}`
    );
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